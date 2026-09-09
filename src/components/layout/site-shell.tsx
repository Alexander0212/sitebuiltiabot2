import { ChatWidget } from "@/components/agent/chat-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileDock } from "@/components/layout/mobile-dock";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a href="#main" className="skip-link">
        Перейти до змісту
      </a>
      <Header />
      <main id="main" className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      <Footer />
      <MobileDock />
      <ChatWidget />
    </div>
  );
}
