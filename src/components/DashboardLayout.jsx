import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
const DashboardLayout = ({ children }) => {
    return (<SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-background sticky top-0 z-10">
            <SidebarTrigger className="mr-4"/>
            <div className="flex-1"/>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>);
};
export default DashboardLayout;
