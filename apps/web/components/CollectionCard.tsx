'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CollectionCardProps {
  title: string;
  description: string;
  imageUrls: string[];
  href: string;
}

export default function CollectionCard({ title, description, imageUrls, href }: CollectionCardProps) {
  return (
    <Link href={href} className="group block">
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 border border-black/5 dark:border-white/5 h-full flex flex-col transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/5"
      >
        <div className="grid grid-cols-2 gap-2 mb-6 h-32 overflow-hidden rounded-xl">
          {imageUrls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className={`bg-gray-200 dark:bg-gray-700 w-full h-full object-cover rounded-lg ${
                i === 0 ? 'col-span-2 h-20' : 'h-10'
              }`}
            >
              {/* Optional Next/Image here */}
            </div>
          ))}
        </div>
        <h3 className="font-outfit text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">
          {description}
        </p>
        <div className="flex items-center text-sm font-semibold text-primary">
          Explore Collection <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
}
