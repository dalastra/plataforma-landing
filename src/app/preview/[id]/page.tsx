import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project || !project.htmlContent) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: project.htmlContent }}
      style={{ minHeight: '100vh', margin: 0, padding: 0 }}
    />
  );
}
