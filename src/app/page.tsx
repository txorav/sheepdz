import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Shield, CreditCard, MapPin, Users, TrendingUp } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                🇩🇿
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Sheep Distribution</h1>
                <p className="text-xs text-slate-500">Algeria 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tracking" className="text-slate-600 hover:text-slate-900">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Track Distribution
                </Link>
              </Button>
              {session ? (
                <>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    Welcome, {session.user?.name}
                  </Badge>
                  {session.user?.role === 'ADMIN' && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/admin/dashboard">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
                  {session.user?.role === 'WILAYA_ADMIN' && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/wilaya-admin/dashboard">
                        <Users className="w-4 h-4 mr-2" />
                        Wilaya Panel
                      </Link>
                    </Button>
                  )}
                  {session.user?.role === 'CUSTOMER' && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/customer/dashboard">
                        <MapPin className="w-4 h-4 mr-2" />
                        My Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/api/auth/signout">
                      Sign Out
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/signin">
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Algeria 2025 Initiative
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Fair Sheep
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {" "}Distribution
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Ensuring equitable access to imported sheep for Eid celebrations across all 48 wilayas of Algeria. 
              One family, one sheep - transparent and fair.
            </p>
            
            {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Link href="/auth/signup">
                    Start Your Reservation
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/tracking">
                    Track Distribution
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A streamlined, transparent process ensuring fair distribution across all of Algeria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Register & Verify</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Register with your family notebook number. Our system ensures one registration per family 
                  for fair distribution.
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full -translate-y-16 translate-x-16" />
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Reserve & Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Make your reservation online and pay securely via CCP, bank transfer, 
                  or choose cash payment on pickup.
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full -translate-y-16 translate-x-16" />
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-900">Track & Pickup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  Receive notifications about your pickup schedule. Visit your designated 
                  distribution center at the confirmed time.
                </p>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -translate-y-16 translate-x-16" />
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">48</div>
              <div className="text-slate-600">Wilayas Covered</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">100K+</div>
              <div className="text-slate-600">Families Served</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">99.8%</div>
              <div className="text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Reserve Your Sheep?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of Algerian families who trust our fair distribution system.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Link href="/auth/signup">
                Get Started Today
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                🇩🇿
              </div>
              <div>
                <div className="font-semibold text-white">Sheep Distribution Algeria</div>
                <div className="text-sm">Fair access for all families</div>
              </div>
            </div>
            <div className="text-sm">
              © 2025 Government of Algeria. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
