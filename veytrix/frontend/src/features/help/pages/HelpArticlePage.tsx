import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { helpArticles } from '../../../data/helpArticles';
import { HelpArticleLayout } from '../../../components/help/HelpArticleLayout';

export function HelpArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const article = helpArticles.find((art) => art.id === articleId);

  if (!article) {
    return <Navigate to="/help" replace />;
  }

  return (
    <div className="w-full min-h-screen bg-background py-8">
      <HelpArticleLayout article={article} />
    </div>
  );
}

export default HelpArticlePage;
