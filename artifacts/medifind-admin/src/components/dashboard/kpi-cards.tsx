import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Store, Target, TrendingUp, Minus } from "lucide-react";

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      
      {/* Revenue Card */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-display font-bold text-foreground">$2,847,392</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Patients Card */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
              <p className="text-3xl font-display font-bold text-foreground">48,291</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-medium text-muted-foreground">
              <Minus className="w-3 h-3 mr-1" />
              0%
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacies Card */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pending Pharmacies</p>
              <p className="text-3xl font-display font-bold text-foreground">23</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Store className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Badge variant="warning" className="text-[10px] uppercase tracking-wider font-bold">
              Needs Review
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI OCR Card */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">AI OCR Success Rate</p>
              <p className="text-3xl font-display font-bold text-foreground">96.4%</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-success h-1.5 rounded-full" style={{ width: '96.4%' }} />
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="success" className="text-[10px] uppercase tracking-wider font-bold">
                Above Target
              </Badge>
              <span className="text-[10px] text-muted-foreground">Target: 94%</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
