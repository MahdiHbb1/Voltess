import React from 'react';
import { TARGET_USERS } from '@/content/landing';
import { Section, Card, Chip } from '../ui';

export function TargetUsers() {
  return (
    <Section id="untuk-siapa" className="bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center mb-12">
        <h2 className="heading-lg text-brand-dark mb-4">
          {TARGET_USERS.title}
        </h2>
        <p className="body-lg text-gray-600 max-w-2xl mx-auto">
          {TARGET_USERS.subtitle}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {TARGET_USERS.categories.map((category, i) => (
          <Card key={i} hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-brand-dark text-lg">
                  {category.name}
                </h3>
                {category.status === 'soon' && (
                  <Chip variant="planned" className="text-xs">
                    Segera
                  </Chip>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Satuan:</span> {category.unit}
                </p>
                
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Alat yang umum:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.appliances.map((appliance, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 bg-blue-50 text-brand-blue rounded-lg"
                      >
                        {appliance}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-base text-gray-700 font-medium bg-white rounded-2xl p-6 border border-gray-100">
          {TARGET_USERS.criteria}
        </p>
      </div>
    </Section>
  );
}
