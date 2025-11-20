export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">About</h3>
            <p className="text-sm text-muted-foreground">
              Quran Memorizer helps Muslims worldwide memorize the Holy Quran
              using AI-powered spaced repetition and beautiful recitations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/memorize"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Start Memorizing
                </a>
              </li>
              <li>
                <a
                  href="/review"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Review Queue
                </a>
              </li>
              <li>
                <a
                  href="/progress"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Track Progress
                </a>
              </li>
              <li>
                <a
                  href="/community"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Join Community
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/tips"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Memorization Tips
                </a>
              </li>
              <li>
                <a
                  href="/reciters"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reciters
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quran Memorizer. Built with love for the Muslim Ummah.
          </p>
          <p className="mt-2 text-lg arabic-text">
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            &quot;And We have certainly made the Quran easy for remembrance&quot; (54:17)
          </p>
        </div>
      </div>
    </footer>
  );
}
