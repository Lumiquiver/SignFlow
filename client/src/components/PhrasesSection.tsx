import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gesture } from '@/types';

interface PhrasesSectionProps {
  phrases: Gesture[];
}

export default function PhrasesSection({ phrases }: PhrasesSectionProps) {
  return (
    <section className="mt-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 border-b border-[#DADCE0] space-y-0">
          <CardTitle className="text-lg font-['Google_Sans'] font-medium text-[#202124]">Common ASL Phrases</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {phrases.map(phrase => (
              <div 
                key={phrase.id}
                className="bg-[#F1F3F4] hover:bg-[#DADCE0] rounded-lg p-3 transition duration-150 cursor-pointer"
              >
                <div className="font-['Google_Sans'] font-medium mb-1">{phrase.name}</div>
                <div className="text-sm text-gray-600">
                  <span className="material-icons text-xs align-middle mr-1">gesture</span>
                  {phrase.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
