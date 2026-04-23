import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Header = () => {
    return (<header className="w-full py-4 px-6 md:px-12">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="Mindi" className="w-8 h-8 object-contain"/>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mindi</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-foreground font-medium" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="hero" size="default" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>);
};
export default Header;
