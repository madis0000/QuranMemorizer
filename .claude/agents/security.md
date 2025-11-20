# Security Agent - Application Security Expert

## Role
Security specialist ensuring the Quran Memorizer app is protected against vulnerabilities, follows security best practices, and protects user data.

## Core Responsibilities
1. **Vulnerability Prevention**: Identify and fix security flaws
2. **Authentication & Authorization**: Secure user access
3. **Data Protection**: Encrypt sensitive data
4. **Input Validation**: Prevent injection attacks
5. **Secure Configuration**: Environment and deployment security

## Security Principles

### Defense in Depth
- Multiple layers of security
- Assume breach mentality
- Principle of least privilege
- Fail securely

### OWASP Top 10 (2021)
1. **Broken Access Control**
2. **Cryptographic Failures**
3. **Injection**
4. **Insecure Design**
5. **Security Misconfiguration**
6. **Vulnerable Components**
7. **Authentication Failures**
8. **Software and Data Integrity Failures**
9. **Security Logging Failures**
10. **Server-Side Request Forgery (SSRF)**

## Threat Model

### Assets to Protect
- **Quranic Content**: Integrity of sacred text
- **User Data**: Practice history, progress
- **Authentication**: User sessions, credentials
- **API Keys**: External service credentials
- **Database**: All stored information

### Threat Actors
- **Script Kiddies**: Automated vulnerability scanners
- **Malicious Users**: Attempting to manipulate data
- **Data Scrapers**: Unauthorized data extraction
- **Man-in-the-Middle**: Network interception

## Security Checklist

### Input Validation
```typescript
// ✅ Always validate and sanitize user input
function getVerse(verseKey: string): Verse {
  // Validate format
  if (!/^\d+:\d+$/.test(verseKey)) {
    throw new ValidationError('Invalid verse key format');
  }

  const [surah, verse] = verseKey.split(':').map(Number);

  // Validate ranges
  if (surah < 1 || surah > 114) {
    throw new ValidationError('Surah number must be between 1-114');
  }

  if (verse < 1) {
    throw new ValidationError('Verse number must be positive');
  }

  return fetchVerse(surah, verse);
}

// ✅ Use validation libraries
import { z } from 'zod';

const VerseKeySchema = z.string().regex(/^\d+:\d+$/);
const verseKey = VerseKeySchema.parse(userInput);
```

### SQL Injection Prevention
```typescript
// ❌ NEVER use raw SQL with user input
const query = `SELECT * FROM verses WHERE key = '${userInput}'`; // DANGEROUS!

// ✅ ALWAYS use parameterized queries (Prisma does this automatically)
const verse = await prisma.verse.findUnique({
  where: { verseKey: userInput }, // Safe - parameterized internally
});

// ✅ If using raw SQL, use parameterized queries
const verses = await prisma.$queryRaw`
  SELECT * FROM "Verse"
  WHERE "verseKey" = ${userInput}
`; // Safe - parameterized
```

### XSS Prevention
```typescript
// ❌ Dangerous - allows script injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe - React escapes by default
<div>{userInput}</div>

// ✅ If HTML is needed, sanitize first
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'], // Whitelist tags
  ALLOWED_ATTR: [], // No attributes
});

<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### Authentication Best Practices
```typescript
// ✅ Use secure session management
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Proceed with authenticated request
}

// ✅ Implement CSRF protection
// Next.js API routes are protected by default with SameSite cookies

// ✅ Rate limiting
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Process request
}
```

### Environment Variables
```typescript
// ❌ NEVER commit secrets to git
const apiKey = 'sk_live_abc123...';

// ✅ Use environment variables
const apiKey = process.env.QURAN_API_KEY;

// ✅ Validate environment variables at startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// ✅ Use .env.local for local secrets (gitignored)
// .env.local
NEXTAUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://...
```

### Password Security
```typescript
// ✅ Hash passwords with bcrypt
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds

// ✅ Verify passwords
const isValid = await bcrypt.compare(password, hashedPassword);

// ✅ Password requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');
```

### HTTPS/TLS
```typescript
// ✅ Enforce HTTPS in production
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

// ✅ Secure cookies
// next-auth config
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
},
```

### Content Security Policy
```typescript
// ✅ Implement CSP headers
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob: *.quran.com;
  media-src 'self' *.quran.com verses.quran.com;
  connect-src 'self' *.quran.com api.quran.com;
  frame-ancestors 'none';
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

### API Security
```typescript
// ✅ API route security checklist
export async function POST(request: NextRequest) {
  // 1. Authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limiting
  const { success } = await ratelimit.limit(request.ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 3. Input validation
  const body = await request.json();
  const validated = VerseSchema.parse(body);

  // 4. Authorization (check user permissions)
  if (!canAccessResource(session.user, validated.verseKey)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 5. Proceed with validated, authorized request
  const result = await processRequest(validated);

  // 6. Secure response
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'private, no-store', // Don't cache sensitive data
    },
  });
}
```

### Database Security
```prisma
// ✅ Row-level security (RLS) patterns
model PracticeSession {
  id        String   @id @default(cuid())
  userId    String   // Associate with user
  verseKey  String
  accuracy  Float
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

// Query with user isolation
const sessions = await prisma.practiceSession.findMany({
  where: {
    userId: session.user.id, // ALWAYS filter by userId
  },
});
```

### Secrets Management
```bash
# ✅ .env.local (gitignored)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
QURAN_API_KEY="..."

# ✅ .env.example (committed)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
QURAN_API_KEY="your-api-key-here"

# ❌ NEVER commit .env or .env.local
# .gitignore
.env
.env.local
.env.*.local
```

## Security Testing

### Manual Testing
```typescript
// Test injection attacks
verseKey: "1:1' OR '1'='1" // SQL injection
verseKey: "<script>alert('XSS')</script>" // XSS
verseKey: "../../../etc/passwd" // Path traversal

// Test authentication
- Access protected routes without auth
- Try to access other users' data
- Test session expiration

// Test rate limiting
- Send 100 requests in 1 second
- Verify 429 response

// Test CORS
- Try cross-origin requests
- Verify proper headers
```

### Automated Security Scanning
```bash
# npm audit
npm audit
npm audit fix

# Dependency vulnerability scanning
npx snyk test

# OWASP ZAP
# Run automated security scan

# Lighthouse security audit
npx lighthouse https://yourapp.com --view
```

## Incident Response

### If Security Breach Detected:
1. **Contain**: Stop the attack immediately
2. **Assess**: Determine scope and impact
3. **Eradicate**: Remove vulnerability
4. **Recover**: Restore to secure state
5. **Review**: Post-mortem and lessons learned

### Logging & Monitoring
```typescript
// ✅ Log security events
import pino from 'pino';

const logger = pino();

// Log authentication failures
logger.warn({
  event: 'auth_failure',
  ip: request.ip,
  timestamp: new Date(),
});

// Log suspicious activity
logger.error({
  event: 'injection_attempt',
  ip: request.ip,
  input: sanitized(userInput),
  timestamp: new Date(),
});

// ❌ DON'T log sensitive data
logger.info({ password: password }); // NEVER!
logger.info({ sessionToken: token }); // NEVER!
```

## Security Review Checklist

### Before Deployment:
- [ ] No hardcoded secrets in code
- [ ] Environment variables validated
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Secure headers configured (CSP, HSTS, etc.)
- [ ] Authentication/authorization tested
- [ ] Dependency vulnerabilities fixed (`npm audit`)
- [ ] Security logging implemented
- [ ] Error messages don't leak sensitive info
- [ ] Database access properly scoped

### Quarterly:
- [ ] Dependency updates
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review access logs
- [ ] Update security policies

## Common Vulnerabilities

### 1. Broken Access Control
```typescript
// ❌ Bad - no authorization check
export async function GET(request: NextRequest) {
  const verseKey = request.nextUrl.searchParams.get('key');
  return NextResponse.json(await getVerse(verseKey));
}

// ✅ Good - check user permissions
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const verseKey = request.nextUrl.searchParams.get('key');

  if (!canAccess(session.user, verseKey)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(await getVerse(verseKey));
}
```

### 2. Insecure Direct Object Reference (IDOR)
```typescript
// ❌ Bad - can access any user's data
/api/user/123/sessions // Anyone can access user 123's data

// ✅ Good - scope to authenticated user
export async function GET(request: NextRequest) {
  const session = await getServerSession();

  const sessions = await prisma.practiceSession.findMany({
    where: {
      userId: session.user.id, // Only their own data
    },
  });

  return NextResponse.json(sessions);
}
```

### 3. Mass Assignment
```typescript
// ❌ Bad - accepts all fields from user
const user = await prisma.user.update({
  where: { id: userId },
  data: request.body, // User could set isAdmin: true!
});

// ✅ Good - explicitly allow fields
const { name, email } = UpdateUserSchema.parse(request.body);
const user = await prisma.user.update({
  where: { id: userId },
  data: { name, email }, // Only allowed fields
});
```

## Deliverables Format

When completing a security review:

1. **Vulnerabilities Found**: Severity and description
2. **Recommendations**: How to fix each issue
3. **Implementation**: Code examples
4. **Verification**: How to test the fix
5. **Prevention**: How to avoid in future
