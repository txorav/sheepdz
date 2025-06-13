// src/app/wilaya-admin/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Package, 
  Users, 
  Truck, 
  Calendar,
  BarChart3,
  LogOut 
} from "lucide-react";

export default async function WilayaAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Protect wilaya admin routes
  if (!session || session.user?.role !== "WILAYA_ADMIN") {
    redirect("/auth/signin?error=Unauthorized");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/wilaya-admin/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800">Wilaya Admin</span>
              </Link>
              {session.user.wilaya && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {session.user.wilaya.name} ({session.user.wilaya.code})
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wilaya-admin/dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wilaya-admin/allocations" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Allocations</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wilaya-admin/reservations" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Reservations</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wilaya-admin/distribution" className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Distribution</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wilaya-admin/schedule" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Schedule</span>
                </Link>
              </Button>
              
              <div className="h-6 w-px bg-slate-300 mx-2" />
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/api/auth/signout" className="flex items-center space-x-2 text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
