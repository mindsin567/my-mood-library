import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
const DashboardLayout = ({ children }) => {
    return (<SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <SidebarTrigger className="mr-4"/>
            <div className="flex-1"/>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>);
};
export default DashboardLayout;
