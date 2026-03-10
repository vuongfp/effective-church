import React from "react";
import PublicHeader from "@/components/public/PublicHeader";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "10 Ways to Optimize Your Church Management",
      excerpt: "Learn best practices from successful churches across the country.",
      author: "Sarah Johnson",
      date: "2026-02-20",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Church CRM",
    },
    {
      id: 2,
      title: "Boost Sales with Effective Pipeline Management",
      excerpt: "Discover pipeline strategies from top performing sales teams.",
      author: "Mike Chen",
      date: "2026-02-18",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Business CRM",
    },
    {
      id: 3,
      title: "Building Sustainable Habits: A Beginner's Guide",
      excerpt: "Science-backed tips for building lasting habits and achieving goals.",
      author: "Emma Wilson",
      date: "2026-02-15",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Effective Living",
    },
    {
      id: 4,
      title: "The Power of Sales Automation",
      excerpt: "Save time and increase productivity with sales process automation.",
      author: "Alex Rodriguez",
      date: "2026-02-12",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Business CRM",
    },
    {
      id: 5,
      title: "Pastoral Care in the Digital Age",
      excerpt: "How to use technology to enhance rather than replace personal pastoral care.",
      author: "David Martinez",
      date: "2026-02-10",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Church CRM",
    },
    {
      id: 6,
      title: "Work-Life Balance: Lessons from Effective Living",
      excerpt: "Learn how thousands of users are achieving better life balance.",
      author: "Lisa Thompson",
      date: "2026-02-08",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      category: "Effective Living",
    },
  ];

  const categories = ["All", "Church CRM", "Business CRM", "Effective Living"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 sm:py-24 text-white pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Articles, guides, and tips to help you succeed
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-slate-600">
                No articles found for this category. Check back later!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't miss new articles
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Get the latest articles and tips delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500"
            />
            <Button className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2026 Effective CRM Suite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}