import React, { useState, useEffect } from 'react';
import { Course, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../i18n/translations';
import { api } from '../services/api';
import { Search, Filter, BookOpen, Crown, ChevronRight, Sparkles } from 'lucide-react';

interface CoursesViewProps {
  onSelectCourse: (courseId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  onSelectCourse,
  selectedCategory,
  setSelectedCategory,
}) => {
  const { language } = useAuth();
  const t = getTranslation(language);

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'premium'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, coursesRes] = await Promise.all([
          api.getCategories(),
          api.getCourses({
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: searchQuery.trim() || undefined,
          }),
        ]);
        setCategories(catsRes.categories || []);
        setCourses(coursesRes.courses || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, searchQuery]);

  // Client side plan filter
  const filteredCourses = courses.filter((c) => {
    if (filterPlan === 'free') return !c.isPremium;
    if (filterPlan === 'premium') return c.isPremium;
    return true;
  });

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-200">
      {/* Title & Search Omnibar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>{t.nav.courses}</span>
            </h1>
            <p className="text-xs text-slate-400">
              सर्व विषयांचे उत्कृष्ट व्हिडिओ, हस्तलिखित नोट्स व प्रश्नसंच
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          सर्व अभ्यासक्रम (All)
        </button>

        {categories.map((cat) => {
          const catName =
            language === 'mr' ? cat.nameMr : language === 'hi' ? cat.nameHi : cat.nameEn;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Free / Premium Sub-filter */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          <span>फिल्टर:</span>
          <button
            onClick={() => setFilterPlan('all')}
            className={`px-2 py-0.5 rounded-lg ${
              filterPlan === 'all' ? 'text-indigo-400 font-bold bg-indigo-500/10' : 'hover:text-slate-200'
            }`}
          >
            सर्व ({courses.length})
          </button>
          <span>•</span>
          <button
            onClick={() => setFilterPlan('free')}
            className={`px-2 py-0.5 rounded-lg ${
              filterPlan === 'free' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'hover:text-slate-200'
            }`}
          >
            {t.common.free}
          </button>
          <span>•</span>
          <button
            onClick={() => setFilterPlan('premium')}
            className={`px-2 py-0.5 rounded-lg ${
              filterPlan === 'premium' ? 'text-amber-400 font-bold bg-amber-500/10' : 'hover:text-slate-200'
            }`}
          >
            {t.common.premium}
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t.common.loading}</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800 p-8">
          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="font-semibold text-slate-300">कोणतेही अभ्यासक्रम सापडले नाहीत.</p>
          <p className="text-slate-500 mt-1">कृपया शोध शब्द किंवा श्रेणी बदलून पहा.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => {
            const courseTitle =
              language === 'mr'
                ? course.titleMr
                : language === 'hi'
                ? course.titleHi
                : course.titleEn;

            const courseDesc =
              language === 'mr'
                ? course.descriptionMr
                : language === 'hi'
                ? course.descriptionHi
                : course.descriptionEn;

            return (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 overflow-hidden cursor-pointer shadow-md hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={course.thumbnail}
                      alt={courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-700">
                        {course.grade}
                      </span>
                      {course.isPremium ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-sm">
                          <Crown className="w-3 h-3 fill-slate-950" />
                          {t.common.premium}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-sm">
                          {t.common.free}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {courseTitle}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {courseDesc}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {course.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                      <span className="truncate max-w-[150px] font-medium">{course.instructor}</span>
                      <span className="text-amber-400 font-bold">★ {course.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
                  <span className="text-slate-400">
                    {course.totalStudents.toLocaleString()} विद्यार्थी
                  </span>
                  <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-0.5">
                    अभ्यासक्रम पहा
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
