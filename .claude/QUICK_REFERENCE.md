# Agent System - Quick Reference

## Quick Agent Selection

### Frontend Issues → **UI/UX Agent**
- Styling, layout, components
- Responsive design
- Accessibility
- Animations

### Code Quality → **Code Review Agent**
- After changes
- Before merge
- Refactoring
- Best practices

### Slow Performance → **Performance Agent**
- Slow loads
- Large bundles
- Database queries
- Memory issues

### Security Concerns → **Security Agent**
- Authentication
- Input validation
- Vulnerabilities
- Secrets management

### Arabic/Quranic → **Arabic & Quranic Agent**
- Tajweed rules
- Arabic text
- RTL layout
- Islamic content

### Database Work → **Database Agent**
- Schema design
- Query optimization
- Migrations
- Indexes

### Testing → **Testing Agent**
- Test creation
- Bug reproduction
- Coverage
- E2E tests

### Deployment → **DevOps Agent**
- Docker
- CI/CD
- Environment config
- Monitoring

### Documentation → **Documentation Agent**
- Progress tracking
- Todo management
- API docs
- User guides

### Complex Tasks → **Maestro Agent**
- Multi-agent coordination
- Architectural decisions
- Feature planning
- Cross-cutting concerns

## Quick Commands

```bash
# Ask a specific agent
"@UI/UX: Fix mobile menu overflow"
"@Security: Review authentication flow"
"@Performance: Optimize verse loading"

# Let Maestro decide
"Add verse bookmarking feature"  # Maestro delegates
"The app is slow"                # Maestro investigates

# Multiple agents
"Review and test the login feature"  # Code Review + Testing
```

## Common Scenarios

| What You Need | Agent(s) | Example |
|---------------|----------|---------|
| New feature | Maestro → Multiple | "Add dark mode" |
| UI bug | UI/UX | "Button misaligned on mobile" |
| Slow query | Database + Performance | "Sessions query is slow" |
| Security issue | Security | "Validate verse key input" |
| Arabic problem | Arabic/Quranic + UI/UX | "Tajweed colors not showing" |
| Deploy issue | DevOps | "Docker build failing" |
| Missing tests | Testing | "Write tests for verse API" |
| Update docs | Documentation | "Document bookmark API" |
| Code review | Code Review | "Review PR #42" |

## Agent Specialties

### Maestro
- 🎯 Project orchestration
- 🎯 Task breakdown
- 🎯 Agent coordination
- 🎯 Quality assurance

### UI/UX
- 🎨 Component design
- 🎨 Tailwind CSS
- 🎨 Accessibility
- 🎨 Responsive layout

### Code Review
- 🔍 TypeScript patterns
- 🔍 React best practices
- 🔍 Code quality
- 🔍 Architecture

### Performance
- ⚡ Bundle optimization
- ⚡ Query tuning
- ⚡ Caching
- ⚡ Profiling

### Security
- 🔒 Authentication
- 🔒 Input validation
- 🔒 Vulnerability scanning
- 🔒 Secrets management

### Arabic/Quranic
- 📖 Tajweed rules
- 📖 Arabic typography
- 📖 RTL support
- 📖 Islamic authenticity

### Database
- 🗄️ Schema design
- 🗄️ Query optimization
- 🗄️ Migrations
- 🗄️ Indexing

### Testing
- ✅ Unit tests
- ✅ Integration tests
- ✅ E2E tests
- ✅ Bug reproduction

### DevOps
- 🚀 Docker
- 🚀 CI/CD
- 🚀 Deployment
- 🚀 Monitoring

### Documentation
- 📝 Progress tracking
- 📝 API docs
- 📝 User guides
- 📝 Changelog

## Priority Levels

### 🔴 Critical (Use immediately)
- Security vulnerabilities
- Production outages
- Data loss risks
- Blocking bugs

### 🟡 High (Use soon)
- Feature development
- Performance issues
- User experience problems
- Missing tests

### 🟢 Normal (Use when convenient)
- Code refactoring
- Documentation updates
- Nice-to-have features
- Minor improvements

## Success Indicators

**Good Agent Use**:
- ✅ Clear, specific requests
- ✅ Appropriate agent selected
- ✅ Context provided
- ✅ Deliverables defined

**Great Outcomes**:
- ✅ Task completed successfully
- ✅ Quality gates passed
- ✅ Documentation updated
- ✅ Tests added

## Tips

1. **Be Specific**: "Fix button" → "Fix login button alignment on mobile"
2. **Provide Context**: Include relevant code, error messages, screenshots
3. **Define Success**: What does "done" look like?
4. **Trust the Process**: Let agents do their job thoroughly
5. **Review Outputs**: Verify deliverables meet your needs

## Emergency Response

### Production Down 🚨
1. DevOps Agent (immediate)
2. Database Agent (if DB issue)
3. Security Agent (if breach)
4. Documentation Agent (incident report)

### Security Breach 🔒
1. Security Agent (contain)
2. DevOps Agent (rollback if needed)
3. Database Agent (check data integrity)
4. Documentation Agent (incident log)

### Performance Crisis ⚡
1. Performance Agent (profile)
2. Database Agent (query check)
3. DevOps Agent (infrastructure)
4. Code Review Agent (code analysis)

## Keep in Mind

- **Maestro coordinates** when multiple agents needed
- **Specialists are experts** in their domain
- **Code Review validates** all code changes
- **Documentation records** significant changes
- **Testing verifies** everything works

---

**Remember**: Each agent is here to make your project world-class!
