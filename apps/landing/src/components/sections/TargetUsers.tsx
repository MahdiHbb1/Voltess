'use client';

import { useEffect, useRef } from 'react';

const BUSINESS_CATEGORIES = [
  { name: 'Laundry', appliances: 'Washing machine · Dryer · Iron' },
  { name: 'Restaurant / Food stall', appliances: 'Fridge/freezer · Rice cooker · Electric stove' },
  { name: 'Bakery / Catering', appliances: 'Oven · Mixer · Proofer' },
  { name: 'Water / Ice depot', appliances: 'Pump · Water filter · Ice machine' },
  { name: 'Café / Beverages', appliances: 'Espresso machine · Blender · Display fridge' },
  { name: 'Custom', appliances: 'Add your own appliances' },
];

export function TargetUsers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let animationId: number;
    let scrollPosition = 0;
    
    const scroll = () => {
      scrollPosition += 0.5; // Speed of scroll
      
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <section id="target-users" className="section-padding bg-navy-50 overflow-hidden">
      <div className="container-width">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Who it's for
          </h2>
          <p className="text-lg text-navy-700">
            Best for: significant electricity bill, high-power appliances, uses phone/WhatsApp
          </p>
        </div>
        
        {/* Scrolling marquee */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-hidden"
          style={{ scrollBehavior: 'auto' }}
        >
          {/* Duplicate items for seamless loop */}
          {[...BUSINESS_CATEGORIES, ...BUSINESS_CATEGORIES].map((category, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 bg-white rounded-xl p-6 border-2 border-navy-900 shadow-lg"
            >
              <h3 className="text-xl font-bold text-navy-900 mb-2">{category.name}</h3>
              <p className="text-sm text-navy-600">
                {category.appliances}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
