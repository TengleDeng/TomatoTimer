import { Link, useLocation } from "wouter";
import { 
  Timer, 
  CheckSquare, 
  BarChart2, 
  Settings as SettingsIcon 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-card border-t border-border dark:border-border shadow-lg z-10">
      <div className="max-w-lg mx-auto flex justify-around">
        <NavItem 
          href="/"
          icon={<Timer className="w-6 h-6" />}
          label={t('nav.timer')}
          isActive={location === "/"}
        />
        <NavItem 
          href="/tasks"
          icon={<CheckSquare className="w-6 h-6" />}
          label={t('nav.tasks')}
          isActive={location === "/tasks"}
        />
        <NavItem 
          href="/stats"
          icon={<BarChart2 className="w-6 h-6" />}
          label={t('nav.stats')}
          isActive={location === "/stats"}
        />
        <NavItem 
          href="/settings"
          icon={<SettingsIcon className="w-6 h-6" />}
          label={t('nav.settings')}
          isActive={location === "/settings"}
        />
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={`flex flex-col items-center p-3 ${
        isActive ? 'text-primary dark:text-primary' : 'text-muted-foreground'
      }`}>
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
}
