import { BarChart2, BookOpen, Home, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navItems = [
    { id: "/", icon: Home, label: "ホーム" },
    { id: "/training", icon: Zap, label: "鍛錬" },
    { id: "/stats", icon: BarChart2, label: "分析" },
    { id: "/variations", icon: BookOpen, label: "極意" },
    { id: "/settings", icon: Settings, label: "設定" },
  ];

  return (
    <div className="layout-container">
      {/* Header */}
      <header className="layout-header">
        <h1 className="layout-title senkai-gradient">研鑽(kenzan)-腕立て</h1>
        <div className="flex items-center gap-2">
          <div className="layout-avatar-container">
            <img
              src="https://picsum.photos/id/1025/100"
              alt="Avatar"
              className="layout-avatar-img"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="layout-main">{children}</main>

      {/* Navigation */}
      <nav className="layout-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.id;
          return (
            <Link
              key={item.id}
              href={item.id}
              className={`layout-nav-item ${
                isActive ? "layout-nav-item--active" : ""
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 3 : 2} />
              <span className="layout-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
