use client;

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { TemplateCard } from '~/components/template-card';
import { Template } from '~/types/template';
import { getTemplates } from '~/utils/template-utils';

export default function TemplateGalleryPage() {
  const pathname = usePathname();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const templates = await getTemplates();
      setTemplates(templates);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold mb-4">Template Gallery</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}