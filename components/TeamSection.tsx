'use client';

import React from 'react';
import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  title: string;
  bio: string;
  image: string;
  specialties: string[];
}

const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  title,
  bio,
  image,
  specialties
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-80 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="relative w-full h-full">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 p-5 z-20 text-white">
          <h3 className="text-2xl font-bold">{name}</h3>
          <p className="text-gray-300">{title}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 mb-4">{bio}</p>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-2">专长</h4>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamSection = () => {
  const teamMembers = [
    {
      name: "张明",
      title: "首席造型师",
      bio: "拥有15年理发造型经验，曾在多个国际发型大赛获奖，擅长各种复杂造型和个性设计。",
      image: "/images/barbers/barber-1.jpg",
      specialties: ["创意剪裁", "明星造型", "彩色染发", "编发"]
    },
    {
      name: "李婷",
      title: "高级美发师",
      bio: "专注于染发和烫发技术，为顾客打造自然且持久的发色，追求细节与品质。",
      image: "/images/barbers/barber-2.jpg",
      specialties: ["渐变染发", "欧美风格", "烫发设计", "护发治疗"]
    },
    {
      name: "王强",
      title: "男士理发专家",
      bio: "专注男士发型设计10年，擅长经典与现代风格相结合，为每位顾客打造最适合的形象。",
      image: "/images/barbers/barber-3.jpg",
      specialties: ["男士短发", "胡须造型", "复古风格", "现代雕刻"]
    },
    {
      name: "刘佳",
      title: "发型设计师",
      bio: "毕业于国际美发学院，关注最新的发型潮流，擅长将国际流行趋势融入个人风格。",
      image: "/images/barbers/barber-4.jpg",
      specialties: ["时尚剪裁", "个性造型", "新娘发型", "日系风格"]
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">我们的团队</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            每一位造型师都经过严格培训和认证，拥有丰富的专业经验，致力于为您提供最优质的服务
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <TeamMember
              key={index}
              name={member.name}
              title={member.title}
              bio={member.bio}
              image={member.image}
              specialties={member.specialties}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
