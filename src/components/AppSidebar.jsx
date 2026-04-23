import { Home, BookOpen, MessageCircle, BarChart3, User, LogOut, Smile, Wind, Gamepad2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar, } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
const menuItems = [
    { title: 'Home', url: '/home', icon: Home },
    { title: 'Mood Log', url: '/mood', icon: Smile },
    { title: 'Digital Library', url: '/library', icon: BookOpen },
    { title: 'AI Chatbot', url: '/chatbot', icon: MessageCircle },
    { title: 'AI Summary', url: '/summary', icon: BarChart3 },
    { title: 'Breathe', url: '/breathe', icon: Wind },
    { title: 'Games', url: '/games', icon: Gamepad2 },
    { title: 'Profile', url: '/profile', icon: User },
];
const AppSidebar = () => {
    const { state } = useSidebar();
    const { signOut, user } = useAuth();
    const collapsed = state === 'collapsed';
    return (<Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        {!collapsed && (<div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="Mindi" className="w-6 h-6 object-contain"/>
            </div>
            <span className="font-semibold text-foreground">Mindi</span>
          </div>)}
        {collapsed && (<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden mx-auto">
            <img src="/favicon.png" alt="Mindi" className="w-6 h-6 object-contain"/>
          </div>)}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (<SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="w-5 h-5 shrink-0"/>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (<div className="text-xs text-muted-foreground mb-2 truncate">
            {user?.email}
          </div>)}
        <Button variant="ghost" size={collapsed ? 'icon' : 'sm'} onClick={signOut} className="w-full justify-start gap-2">
          <LogOut className="w-4 h-4"/>
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>);
};
export default AppSidebar;
