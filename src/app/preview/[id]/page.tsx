import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/db';
import PreviewContainer from '@/components/PreviewContainer';

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

  return <PreviewContainer project={project} />;
}
