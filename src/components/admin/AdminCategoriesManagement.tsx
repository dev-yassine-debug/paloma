import { useState } from "react";
import { useProductCategories, ProductCategory } from "@/hooks/useProductCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, EyeOff, Star, Flame, Sparkles, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const AdminCategoriesManagement = () => {
  const {
    categories,
    isLoading
  } = useProductCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) || category.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    if (filterType === "popular") return matchesSearch && category.is_popular;
    if (filterType === "new") return matchesSearch && category.is_new;
    if (filterType === "featured") return matchesSearch && category.is_featured;
    if (filterType === "active") return matchesSearch && category.is_active;
    if (filterType === "inactive") return matchesSearch && !category.is_active;
    return matchesSearch;
  });
  const getCategoryIcon = (iconName: string) => {
    // Map des icônes Lucide React
    const iconMap: {
      [key: string]: any;
    } = {
      'utensils': '🍽️',
      'apple': '🍎',
      'carrot': '🥕',
      'cheese': '🧀',
      'beef': '🥩',
      'fish': '🐟',
      'bread-slice': '🍞',
      'milk': '🥛',
      'pepper-hot': '🌶️',
      'coffee': '☕',
      'snowflake': '❄️',
      'leaf': '🌱',
      'spray-can': '🧴',
      'wind': '💨',
      'broom': '🧹',
      'file-text': '📄',
      'heart': '💖',
      'palette': '🎨',
      'flower': '🌸',
      'droplet': '💧',
      'scissors': '✂️',
      'mirror': '🪞',
      'bath': '🛁',
      'shirt': '👕',
      'dress': '👗',
      'baby': '👶',
      'shoe': '👟',
      'briefcase': '💼',
      'watch': '⌚',
      'sofa': '🛋️',
      'armchair': '🪑',
      'frame': '🖼️',
      'lightbulb': '💡',
      'bed': '🛏️',
      'chef-hat': '👨‍🍳',
      'toy-brick': '🧸',
      'car': '🚗',
      'smartphone': '📱',
      'tablet': '📱',
      'cable': '🔌',
      'headphones': '🎧',
      'monitor': '🖥️',
      'home': '🏠',
      'wrench': '🔧',
      'droplets': '💧',
      'hammer': '🔨',
      'book': '📚',
      'book-open': '📖',
      'book-heart': '💝',
      'music': '🎵',
      'code': '💻',
      'megaphone': '📢',
      'camera': '📸',
      'pen': '✏️',
      'briefcase-business': '💼',
      'headset': '🎧',
      'plane': '✈️',
      'building': '🏨',
      'map': '🗺️',
      'gamepad-2': '🎮',
      'heart-pulse': '💓',
      'pill': '💊',
      'stethoscope': '🩺',
      'user-doctor': '👨‍⚕️',
      'square': '⬜',
      'circle': '⭕'
    };
    return iconMap[iconName] || '📦';
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفئات...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6 px-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-0">
            إدارة فئات المنتجات والخدمات
          </h1>
          <p className="text-gray-600 mt-2">إدارة وتنظيم جميع فئات المنتجات والخدمات في السوق</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">إجمالي الفئات</p>
                <p className="text-2xl font-bold text-blue-700">{categories.length}</p>
              </div>
              <div className="text-blue-500 text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">الفئات النشطة</p>
                <p className="text-2xl font-bold text-green-700">
                  {categories.filter(c => c.is_active).length}
                </p>
              </div>
              <div className="text-green-500 text-3xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">الأكثر شعبية</p>
                <p className="text-2xl font-bold text-orange-700">
                  {categories.filter(c => c.is_popular).length}
                </p>
              </div>
              <div className="text-orange-500 text-3xl">🔥</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">مميزة</p>
                <p className="text-2xl font-bold text-purple-700">
                  {categories.filter(c => c.is_featured).length}
                </p>
              </div>
              <div className="text-purple-500 text-3xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="البحث في الفئات..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="تصفية حسب..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">غير نشطة</SelectItem>
                  <SelectItem value="popular">شعبية</SelectItem>
                  <SelectItem value="featured">مميزة</SelectItem>
                  <SelectItem value="new">جديدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map(category => <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(category.icon)}</div>
                  <div>
                    <CardTitle className="text-lg">{category.name_ar}</CardTitle>
                    {category.name_en && <p className="text-sm text-gray-500">{category.name_en}</p>}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {category.is_popular && <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      <Flame className="w-3 h-3 mr-1" />
                      شعبي
                    </Badge>}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {category.is_active ? <Badge className="bg-green-100 text-green-700">
                    <Eye className="w-3 h-3 mr-1" />
                    نشط
                  </Badge> : <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    <EyeOff className="w-3 h-3 mr-1" />
                    غير نشط
                  </Badge>}
                
                {category.is_featured && <Badge className="bg-purple-100 text-purple-700">
                    <Star className="w-3 h-3 mr-1" />
                    مميز
                  </Badge>}
                
                {category.is_new && <Badge className="bg-blue-100 text-blue-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    جديد
                  </Badge>}
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <p>الأولوية: {category.priority}</p>
                <p>المعرف: {category.slug}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  تعديل
                </Button>
                <Button variant={category.is_active ? "destructive" : "default"} size="sm" className="flex-1">
                  {category.is_active ? <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      إلغاء تفعيل
                    </> : <>
                      <Eye className="w-4 h-4 mr-1" />
                      تفعيل
                    </>}
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {filteredCategories.length === 0 && <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد فئات</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== "all" ? "لا توجد فئات تطابق معايير البحث والتصفية المحددة" : "لم يتم إنشاء أي فئات بعد"}
          </p>
        </div>}
    </div>;
};
export default AdminCategoriesManagement;