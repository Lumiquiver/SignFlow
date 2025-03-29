import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Gesture } from '@/types';

interface PhrasesSectionProps {
  phrases: Gesture[];
}

export default function PhrasesSection({ phrases }: PhrasesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredPhrase, setHoveredPhrase] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Extract unique categories from phrases
  const categories = Array.from(new Set(phrases.map(p => p.category || p.type)));
  
  // Filter phrases by selected category and search term
  const filteredPhrases = phrases
    .filter(p => !selectedCategory || (p.category || p.type) === selectedCategory)
    .filter(p => 
      !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
  return (
    <section className="mt-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 border-b border-[#DADCE0] space-y-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-['Google_Sans'] font-medium text-[#202124]">MS-ASL Common Phrases & Words</CardTitle>
            {selectedCategory && (
              <Badge 
                variant="outline" 
                className="bg-[#E8F0FE] text-[#1A73E8] cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                {selectedCategory} × 
              </Badge>
            )}
          </div>
          
          {/* Search box */}
          <div className="mt-3 relative">
            <Input
              type="search"
              placeholder="Search MS-ASL phrases and signs..."
              className="w-full rounded-md border border-[#DADCE0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-[#5F6368] material-icons text-base">search</span>
          </div>
          
          {/* Category filter buttons */}
          <div className="flex flex-wrap mt-3 gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`text-xs py-1 h-auto ${selectedCategory === category ? 'bg-[#1A73E8]' : 'text-[#1A73E8] border-[#1A73E8]'}`}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          {/* Results count */}
          <div className="mt-3 text-xs text-[#5F6368]">
            {filteredPhrases.length} MS-ASL sign{filteredPhrases.length !== 1 ? 's' : ''} {searchTerm && `matching "${searchTerm}"`} {selectedCategory && `in category "${selectedCategory}"`}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-[#DADCE0] mb-2">search_off</span>
              <p className="text-gray-500">No MS-ASL signs found</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">
                Try adjusting your search or removing filters
              </p>
              {(searchTerm || selectedCategory) && (
                <Button 
                  variant="outline" 
                  className="mt-4 text-[#1A73E8] border-[#1A73E8]"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                  }}
                >
                  <span className="material-icons text-sm mr-1">refresh</span>
                  Reset filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPhrases.map(phrase => (
                <div 
                  key={phrase.id}
                  className="bg-[#F1F3F4] hover:bg-[#DADCE0] rounded-lg p-3 transition duration-150 cursor-pointer relative"
                  onMouseEnter={() => setHoveredPhrase(phrase.id)}
                  onMouseLeave={() => setHoveredPhrase(null)}
                >
                  {phrase.msaslClass && (
                    <Badge 
                      variant="outline" 
                      className="absolute top-2 right-2 bg-[#1A73E8] text-white text-xs py-0 px-1.5"
                    >
                      MS-ASL Class {phrase.msaslClass}
                    </Badge>
                  )}
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-['Google_Sans'] font-medium">{phrase.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {phrase.category || phrase.type}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="material-icons text-xs align-middle mr-1">gesture</span>
                    {phrase.description}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 text-xs">
                    {phrase.hasMotion && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        <span className="material-icons text-xs mr-1">swipe</span>
                        Motion
                      </Badge>
                    )}
                    
                    {phrase.isTwoHanded && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        <span className="material-icons text-xs mr-1">front_hand</span>
                        Two-handed
                      </Badge>
                    )}
                    
                    {phrase.faceExpression && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        <span className="material-icons text-xs mr-1">sentiment_satisfied_alt</span>
                        {phrase.faceExpression}
                      </Badge>
                    )}
                    
                    {phrase.complexity && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                        <span className="material-icons text-xs mr-1">equalizer</span>
                        Level: {phrase.complexity}/5
                      </Badge>
                    )}
                  </div>
                  
                  {/* Preview button shown on hover */}
                  {hoveredPhrase === phrase.id && phrase.videoUrl && (
                    <Button 
                      variant="outline" 
                      className="mt-2 w-full flex items-center justify-center py-1 h-auto text-xs text-[#1A73E8] border-[#1A73E8]"
                    >
                      <span className="material-icons text-xs mr-1">play_circle</span>
                      View MS-ASL Example
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}