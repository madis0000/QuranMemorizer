import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTajweedData() {
  try {
    // Count total verses
    const totalVerses = await prisma.verse.count();
    console.log(`📊 Total verses in database: ${totalVerses}`);

    // Count verses with Tajweed data
    const versesWithTajweed = await prisma.verse.count({
      where: {
        textUthmaniTajweed: {
          not: null,
        },
      },
    });
    console.log(`🎨 Verses with Tajweed data: ${versesWithTajweed}`);

    // Calculate percentage
    const percentage = totalVerses > 0 ? ((versesWithTajweed / totalVerses) * 100).toFixed(2) : 0;
    console.log(`📈 Tajweed coverage: ${percentage}%`);

    // Sample a few verses to see if they have Tajweed
    const sampleVerses = await prisma.verse.findMany({
      where: {
        verseKey: {
          in: ['1:1', '2:255', '112:1'],
        },
      },
      select: {
        verseKey: true,
        textUthmaniTajweed: true,
      },
    });

    console.log('\n🔍 Sample verses:');
    sampleVerses.forEach((verse) => {
      console.log(`\nVerse ${verse.verseKey}:`);
      if (verse.textUthmaniTajweed) {
        console.log(`  ✅ Has Tajweed data (${verse.textUthmaniTajweed.length} chars)`);
        console.log(`  Preview: ${verse.textUthmaniTajweed.substring(0, 100)}...`);
      } else {
        console.log(`  ❌ No Tajweed data`);
      }
    });

    if (versesWithTajweed === 0) {
      console.log('\n⚠️  WARNING: No Tajweed data found in database!');
      console.log('💡 Solution: Run the database seed script to populate Tajweed data');
      console.log('   Command: npm run db:seed');
    } else if (versesWithTajweed < totalVerses) {
      console.log(`\n⚠️  WARNING: Only ${percentage}% of verses have Tajweed data`);
      console.log('💡 Solution: Re-run the seed script to complete Tajweed data');
    } else {
      console.log('\n✅ All verses have Tajweed data! 🎉');
    }
  } catch (error) {
    console.error('❌ Error checking Tajweed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTajweedData();
