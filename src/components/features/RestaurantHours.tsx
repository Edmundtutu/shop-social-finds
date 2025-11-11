import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RestaurantHoursProps {
  hours?: {
    [key: string]: { open: string; close: string } | null;
  };
}

const RestaurantHours: React.FC<RestaurantHoursProps> = ({ hours }) => {
  if (!hours) return null;

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  
  const todayHours = hours[today];
  
  const isOpen = () => {
    if (!todayHours) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  const open = isOpen();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Hours</h3>
          </div>
          <Badge variant={open ? "default" : "secondary"}>
            {open ? "Open Now" : "Closed"}
          </Badge>
        </div>
        
        {todayHours ? (
          <p className="text-sm text-muted-foreground mb-3">
            Today: {todayHours.open} - {todayHours.close}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">
            Closed today
          </p>
        )}

        <div className="space-y-1 text-sm">
          {daysOfWeek.map((day) => {
            const dayHours = hours[day];
            const isToday = day === today;
            
            return (
              <div
                key={day}
                className={`flex justify-between ${
                  isToday ? 'font-semibold' : 'text-muted-foreground'
                }`}
              >
                <span className="capitalize">{day}</span>
                <span>
                  {dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantHours;
