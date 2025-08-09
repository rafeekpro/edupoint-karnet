import React from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">{title}</h1>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">This page is being migrated to NextUI.</p>
          <p className="text-gray-600 mt-2">Coming soon...</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default ComingSoon;