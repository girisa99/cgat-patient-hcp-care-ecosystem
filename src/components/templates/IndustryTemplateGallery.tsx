import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart,
  Clock,
  Users,
  Zap,
  Building2,
  ShoppingCart,
  Stethoscope,
  GraduationCap,
  Landmark,
  Car,
  Plane,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  count: number;
  description: string;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  rating: number;
  downloads: number;
  lastUpdated: string;
  tags: string[];
  preview: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
  author: string;
  isPopular: boolean;
  isFavorited: boolean;
}

interface IndustryTemplateGalleryProps {
  onTemplateSelect?: (template: AITemplate) => void;
  onTemplatePreview?: (template: AITemplate) => void;
}

export const IndustryTemplateGallery: React.FC<IndustryTemplateGalleryProps> = ({
  onTemplateSelect,
  onTemplatePreview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: TemplateCategory[] = [
    { 
      id: 'healthcare', 
      name: 'Healthcare', 
      icon: Stethoscope, 
      count: 45,
      description: 'Medical workflow automation and patient management'
    },
    { 
      id: 'finance', 
      name: 'Finance', 
      icon: Landmark, 
      count: 38,
      description: 'Financial analysis, risk assessment, and compliance'
    },
    { 
      id: 'ecommerce', 
      name: 'E-commerce', 
      icon: ShoppingCart, 
      count: 52,
      description: 'Online retail, inventory management, and customer service'
    },
    { 
      id: 'education', 
      name: 'Education', 
      icon: GraduationCap, 
      count: 29,
      description: 'Learning management and educational automation'
    },
    { 
      id: 'manufacturing', 
      name: 'Manufacturing', 
      icon: Building2, 
      count: 31,
      description: 'Production optimization and quality control'
    },
    { 
      id: 'transportation', 
      name: 'Transportation', 
      icon: Car, 
      count: 24,
      description: 'Logistics, fleet management, and route optimization'
    },
    { 
      id: 'travel', 
      name: 'Travel & Hospitality', 
      icon: Plane, 
      count: 19,
      description: 'Booking systems, customer service, and experience management'
    },
    { 
      id: 'realestate', 
      name: 'Real Estate', 
      icon: Home, 
      count: 16,
      description: 'Property management and client relationship automation'
    }
  ];

  const [templates, setTemplates] = useState<AITemplate[]>([
    {
      id: 'healthcare-patient-intake',
      name: 'Patient Intake & Triage System',
      description: 'Automated patient registration, symptom assessment, and priority assignment workflow.',
      category: 'healthcare',
      industry: 'Healthcare',
      rating: 4.8,
      downloads: 1247,
      lastUpdated: '2 days ago',
      tags: ['patient-care', 'triage', 'automation', 'medical'],
      preview: '/api/placeholder/300/200',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      features: ['Symptom Assessment AI', 'Priority Queue Management', 'Electronic Health Records Integration'],
      author: 'Dr. Sarah Chen',
      isPopular: true,
      isFavorited: false
    },
    {
      id: 'finance-risk-assessment',
      name: 'Credit Risk Assessment Engine',
      description: 'AI-powered credit scoring and risk evaluation for loan applications.',
      category: 'finance',
      industry: 'Financial Services',
      rating: 4.9,
      downloads: 892,
      lastUpdated: '1 week ago',
      tags: ['risk-analysis', 'credit-scoring', 'machine-learning', 'compliance'],
      preview: '/api/placeholder/300/200',
      difficulty: 'advanced',
      estimatedTime: '4-6 hours',
      features: ['Machine Learning Models', 'Real-time Scoring', 'Regulatory Compliance'],
      author: 'Alex Kumar',
      isPopular: true,
      isFavorited: true
    },
    {
      id: 'ecommerce-recommendation',
      name: 'Product Recommendation Engine',
      description: 'Personalized product suggestions based on customer behavior and preferences.',
      category: 'ecommerce',
      industry: 'Retail',
      rating: 4.7,
      downloads: 2156,
      lastUpdated: '3 days ago',
      tags: ['recommendations', 'personalization', 'machine-learning', 'sales'],
      preview: '/api/placeholder/300/200',
      difficulty: 'intermediate',
      estimatedTime: '3-4 hours',
      features: ['Collaborative Filtering', 'Behavioral Analysis', 'A/B Testing Framework'],
      author: 'Maria Rodriguez',
      isPopular: true,
      isFavorited: false
    },
    {
      id: 'education-grading',
      name: 'Automated Essay Grading System',
      description: 'AI-powered essay evaluation and feedback generation for educational institutions.',
      category: 'education',
      industry: 'Education',
      rating: 4.6,
      downloads: 743,
      lastUpdated: '5 days ago',
      tags: ['natural-language-processing', 'education', 'grading', 'feedback'],
      preview: '/api/placeholder/300/200',
      difficulty: 'advanced',
      estimatedTime: '5-7 hours',
      features: ['NLP Analysis', 'Automated Feedback', 'Plagiarism Detection'],
      author: 'Prof. David Lee',
      isPopular: false,
      isFavorited: false
    },
    {
      id: 'manufacturing-quality',
      name: 'Quality Control Inspection',
      description: 'Computer vision-based defect detection for manufacturing quality assurance.',
      category: 'manufacturing',
      industry: 'Manufacturing',
      rating: 4.8,
      downloads: 654,
      lastUpdated: '1 week ago',
      tags: ['computer-vision', 'quality-control', 'defect-detection', 'automation'],
      preview: '/api/placeholder/300/200',
      difficulty: 'advanced',
      estimatedTime: '6-8 hours',
      features: ['Computer Vision Models', 'Real-time Inspection', 'Statistical Analysis'],
      author: 'Jennifer Walsh',
      isPopular: false,
      isFavorited: true
    },
    {
      id: 'transportation-route',
      name: 'Dynamic Route Optimization',
      description: 'Real-time route planning and optimization for delivery and logistics operations.',
      category: 'transportation',
      industry: 'Logistics',
      rating: 4.5,
      downloads: 456,
      lastUpdated: '4 days ago',
      tags: ['route-optimization', 'logistics', 'real-time', 'efficiency'],
      preview: '/api/placeholder/300/200',
      difficulty: 'intermediate',
      estimatedTime: '3-5 hours',
      features: ['Dynamic Routing', 'Traffic Integration', 'Cost Optimization'],
      author: 'Mike Thompson',
      isPopular: false,
      isFavorited: false
    }
  ]);

  const [filteredTemplates, setFilteredTemplates] = useState<AITemplate[]>(templates);

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(template => template.industry === selectedIndustry);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        // In a real app, you'd sort by actual dates
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, selectedIndustry, sortBy, templates]);

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorited: !template.isFavorited }
        : template
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const industries = ['All', 'Healthcare', 'Financial Services', 'Retail', 'Education', 'Manufacturing', 'Logistics'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Industry AI Template Gallery</h2>
          <p className="text-muted-foreground">
            Discover and deploy industry-specific AI workflows and automation templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Star className="h-3 w-3 mr-1" />
            My Favorites
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            My Downloads
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates, features, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry.toLowerCase() === 'all' ? 'all' : industry}>
                    {industry}
                  </option>
                ))}
              </select>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
              <category.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Category Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant="secondary">{category.count} templates</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Popular Templates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Popular Templates</h3>
              <span className="text-sm text-muted-foreground">
                {filteredTemplates.length} templates
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                              {template.isPopular && (
                                <Badge variant="default" className="text-xs">
                                  <Zap className="h-2 w-2 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(template.id)}
                            className="ml-2 p-1"
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                template.isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Template Preview */}
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>

                        {/* Metadata */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{template.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Download className="h-3 w-3" />
                              <span>{template.downloads.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{template.estimatedTime}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.industry}
                            </Badge>
                            <div 
                              className={`w-2 h-2 rounded-full ${getDifficultyColor(template.difficulty)}`}
                              title={template.difficulty}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {template.difficulty}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.tags.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            by {template.author} • {template.lastUpdated}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => onTemplateSelect?.(template)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Use Template
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => onTemplatePreview?.(template)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </TabsContent>

        {/* Category-specific content */}
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="text-center py-8">
              <category.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{category.name} Templates</h3>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{template.rating}</span>
                          </div>
                          <Button onClick={() => onTemplateSelect?.(template)}>
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};