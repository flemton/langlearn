import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AudioButton from '@/components/AudioButton';
import { DataService } from '@/services/dataService';
import { GoogleTranslateService } from '@/services/googleTranslateService';

const lessonContent = {
  japanese: {
    1: {
      title: 'Hiragana Basics',
      content: [
        { type: 'text', text: 'Hiragana is the fundamental Japanese script used for native words. These are the basic vowel sounds.' },
        { type: 'vocabulary', word: 'あ (a)', romaji: 'a', meaning: 'a (as in father)' },
        { type: 'vocabulary', word: 'い (i)', romaji: 'i', meaning: 'i (as in machine)' },
        { type: 'vocabulary', word: 'う (u)', romaji: 'u', meaning: 'u (as in ruler)' },
        { type: 'vocabulary', word: 'え (e)', romaji: 'e', meaning: 'e (as in red)' },
        { type: 'vocabulary', word: 'お (o)', romaji: 'o', meaning: 'o (as in orange)' },
        { type: 'text', text: 'Now let\'s learn the K sounds combined with vowels.' },
        { type: 'vocabulary', word: 'か (ka)', romaji: 'ka', meaning: 'ka' },
        { type: 'vocabulary', word: 'き (ki)', romaji: 'ki', meaning: 'ki' },
        { type: 'vocabulary', word: 'く (ku)', romaji: 'ku', meaning: 'ku' },
        { type: 'vocabulary', word: 'け (ke)', romaji: 'ke', meaning: 'ke' },
        { type: 'vocabulary', word: 'こ (ko)', romaji: 'ko', meaning: 'ko' },
        { type: 'text', text: 'Practice these basic combinations:' },
        { type: 'vocabulary', word: 'あか (aka)', romaji: 'aka', meaning: 'red' },
        { type: 'vocabulary', word: 'いけ (ike)', romaji: 'ike', meaning: 'pond' },
        { type: 'vocabulary', word: 'おおきい (ookii)', romaji: 'ookii', meaning: 'big' },
      ],
    },
    2: {
      title: 'Katakana Basics',
      content: [
        { type: 'text', text: 'Katakana is used for foreign words, onomatopoeic expressions, and emphasis. Let\'s start with the basics.' },
        { type: 'vocabulary', word: 'ア (a)', romaji: 'a', meaning: 'a' },
        { type: 'vocabulary', word: 'イ (i)', romaji: 'i', meaning: 'i' },
        { type: 'vocabulary', word: 'ウ (u)', romaji: 'u', meaning: 'u' },
        { type: 'vocabulary', word: 'エ (e)', romaji: 'e', meaning: 'e' },
        { type: 'vocabulary', word: 'オ (o)', romaji: 'o', meaning: 'o' },
        { type: 'text', text: 'Katakana is commonly used for foreign loanwords:' },
        { type: 'vocabulary', word: 'パン (pan)', romaji: 'pan', meaning: 'bread' },
        { type: 'vocabulary', word: 'テレビ (terebi)', romaji: 'terebi', meaning: 'television' },
        { type: 'vocabulary', word: 'コーヒー (koohii)', romaji: 'koohii', meaning: 'coffee' },
        { type: 'vocabulary', word: 'サッカー (sakka)', romaji: 'sakka', meaning: 'soccer' },
        { type: 'vocabulary', word: 'アメリカ (amerika)', romaji: 'amerika', meaning: 'America' },
      ],
    },
    3: {
      title: 'Basic Greetings',
      content: [
        { type: 'text', text: 'Japanese greetings are essential for daily communication. Let\'s learn the most common ones.' },
        { type: 'vocabulary', word: 'こんにちは', romaji: 'konnichiwa', meaning: 'hello (daytime)' },
        { type: 'vocabulary', word: 'おはようございます', romaji: 'ohayou gozaimasu', meaning: 'good morning' },
        { type: 'vocabulary', word: 'こんばんは', romaji: 'konbanwa', meaning: 'good evening' },
        { type: 'vocabulary', word: 'さようなら', romaji: 'sayounara', meaning: 'goodbye' },
        { type: 'vocabulary', word: 'ありがとう', romaji: 'arigatou', meaning: 'thank you' },
        { type: 'vocabulary', word: 'すみません', romaji: 'sumimasen', meaning: 'excuse me/sorry' },
        { type: 'vocabulary', word: 'お願いします', romaji: 'onegaishimasu', meaning: 'please' },
        { type: 'vocabulary', word: 'はい', romaji: 'hai', meaning: 'yes' },
        { type: 'vocabulary', word: 'いいえ', romaji: 'iie', meaning: 'no' },
        { type: 'text', text: 'Practice these phrases in context:' },
        { type: 'vocabulary', word: 'おはようございます。今日はいい天気ですね。', romaji: 'Ohayou gozaimasu. Kyou wa ii tenki desu ne.', meaning: 'Good morning. It\'s nice weather today, isn\'t it?' },
      ],
    },
    4: {
      title: 'Numbers 1-10',
      content: [
        { type: 'text', text: 'Learning numbers is fundamental for counting, telling time, and shopping in Japanese.' },
        { type: 'vocabulary', word: '一 (ichi)', romaji: 'ichi', meaning: 'one' },
        { type: 'vocabulary', word: '二 (ni)', romaji: 'ni', meaning: 'two' },
        { type: 'vocabulary', word: '三 (san)', romaji: 'san', meaning: 'three' },
        { type: 'vocabulary', word: '四 (yon)', romaji: 'yon', meaning: 'four' },
        { type: 'vocabulary', word: '五 (go)', romaji: 'go', meaning: 'five' },
        { type: 'vocabulary', word: '六 (roku)', romaji: 'roku', meaning: 'six' },
        { type: 'vocabulary', word: '七 (nana)', romaji: 'nana', meaning: 'seven' },
        { type: 'vocabulary', word: '八 (hachi)', romaji: 'hachi', meaning: 'eight' },
        { type: 'vocabulary', word: '九 (kyuu)', romaji: 'kyuu', meaning: 'nine' },
        { type: 'vocabulary', word: '十 (juu)', romaji: 'juu', meaning: 'ten' },
        { type: 'text', text: 'Practice counting:' },
        { type: 'vocabulary', word: '一、二、三 (ichi, ni, san)', romaji: 'ichi, ni, san', meaning: 'one, two, three' },
      ],
    },
    5: {
      title: 'Family Members',
      content: [
        { type: 'text', text: 'Family vocabulary is important for conversations about relationships and introductions.' },
        { type: 'vocabulary', word: '家族 (kazoku)', romaji: 'kazoku', meaning: 'family' },
        { type: 'vocabulary', word: '父 (chichi)', romaji: 'chichi', meaning: 'father' },
        { type: 'vocabulary', word: '母 (haha)', romaji: 'haha', meaning: 'mother' },
        { type: 'vocabulary', word: '息子 (musuko)', romaji: 'musuko', meaning: 'son' },
        { type: 'vocabulary', word: '娘 (musume)', romaji: 'musume', meaning: 'daughter' },
        { type: 'vocabulary', word: '兄 (ani)', romaji: 'ani', meaning: 'older brother' },
        { type: 'vocabulary', word: '姉 (ane)', romaji: 'ane', meaning: 'older sister' },
        { type: 'vocabulary', word: '弟 (otouto)', romaji: 'otouto', meaning: 'younger brother' },
        { type: 'vocabulary', word: '妹 (imouto)', romaji: 'imouto', meaning: 'younger sister' },
        { type: 'text', text: 'Example sentence:' },
        { type: 'vocabulary', word: '私の家族は五人です (watashi no kazoku wa gonin desu)', romaji: 'watashi no kazoku wa gonin desu', meaning: 'My family has five people' },
      ],
    },
  },
  spanish: {
    1: {
      title: 'Basic Pronunciation',
      content: [
        { type: 'text', text: 'Spanish pronunciation is mostly phonetic. Here are the basic vowel sounds:' },
        { type: 'vocabulary', word: 'a', pronunciation: 'ah', example: 'casa (house)' },
        { type: 'vocabulary', word: 'e', pronunciation: 'eh', example: 'mesa (table)' },
        { type: 'vocabulary', word: 'i', pronunciation: 'ee', example: 'niño (boy)' },
        { type: 'vocabulary', word: 'o', pronunciation: 'oh', example: 'hola (hello)' },
        { type: 'vocabulary', word: 'u', pronunciation: 'oo', example: 'luna (moon)' },
        { type: 'text', text: 'Spanish has consistent pronunciation rules. Unlike English, each letter has only one sound.' },
        { type: 'vocabulary', word: 'b/v', pronunciation: 'similar sound', example: 'beber (to drink), venir (to come)' },
        { type: 'vocabulary', word: 'c/qu', pronunciation: 'k sound', example: 'casa (house), queso (cheese)' },
        { type: 'vocabulary', word: 'g/gu', pronunciation: 'g/h sound', example: 'gato (cat), guitarra (guitar)' },
        { type: 'vocabulary', word: 'j', pronunciation: 'h sound', example: 'jamón (ham)' },
        { type: 'vocabulary', word: 'll', pronunciation: 'y sound', example: 'llamar (to call)' },
        { type: 'vocabulary', word: 'ñ', pronunciation: 'ny sound', example: 'niño (boy)' },
        { type: 'vocabulary', word: 'r/rr', pronunciation: 'rolled r', example: 'perro (dog), carro (car)' },
      ],
    },
    2: {
      title: 'Greetings & Introductions',
      content: [
        { type: 'text', text: 'Essential phrases for meeting people:' },
        { type: 'vocabulary', word: 'Hola', meaning: 'Hello' },
        { type: 'vocabulary', word: 'Buenos días', meaning: 'Good morning' },
        { type: 'vocabulary', word: 'Buenas tardes', meaning: 'Good afternoon' },
        { type: 'vocabulary', word: 'Buenas noches', meaning: 'Good evening/night' },
        { type: 'vocabulary', word: '¿Cómo te llamas?', meaning: 'What is your name?' },
        { type: 'vocabulary', word: 'Me llamo...', meaning: 'My name is...' },
        { type: 'vocabulary', word: 'Mucho gusto', meaning: 'Nice to meet you' },
        { type: 'vocabulary', word: '¿De dónde eres?', meaning: 'Where are you from?' },
        { type: 'vocabulary', word: 'Soy de...', meaning: 'I am from...' },
        { type: 'vocabulary', word: '¿Cuántos años tienes?', meaning: 'How old are you?' },
        { type: 'vocabulary', word: 'Tengo... años', meaning: 'I am... years old' },
        { type: 'text', text: 'Practice these in conversation:' },
        { type: 'vocabulary', word: 'Hola, ¿cómo te llamas? Me llamo María. Mucho gusto.', meaning: 'Hello, what\'s your name? My name is María. Nice to meet you.' },
      ],
    },
    3: {
      title: 'Numbers 1-20',
      content: [
        { type: 'text', text: 'Learning numbers is essential for shopping, telling time, and counting in Spanish.' },
        { type: 'vocabulary', word: 'uno', meaning: 'one' },
        { type: 'vocabulary', word: 'dos', meaning: 'two' },
        { type: 'vocabulary', word: 'tres', meaning: 'three' },
        { type: 'vocabulary', word: 'cuatro', meaning: 'four' },
        { type: 'vocabulary', word: 'cinco', meaning: 'five' },
        { type: 'vocabulary', word: 'seis', meaning: 'six' },
        { type: 'vocabulary', word: 'siete', meaning: 'seven' },
        { type: 'vocabulary', word: 'ocho', meaning: 'eight' },
        { type: 'vocabulary', word: 'nueve', meaning: 'nine' },
        { type: 'vocabulary', word: 'diez', meaning: 'ten' },
        { type: 'vocabulary', word: 'once', meaning: 'eleven' },
        { type: 'vocabulary', word: 'doce', meaning: 'twelve' },
        { type: 'vocabulary', word: 'trece', meaning: 'thirteen' },
        { type: 'vocabulary', word: 'catorce', meaning: 'fourteen' },
        { type: 'vocabulary', word: 'quince', meaning: 'fifteen' },
        { type: 'vocabulary', word: 'dieciséis', meaning: 'sixteen' },
        { type: 'vocabulary', word: 'diecisiete', meaning: 'seventeen' },
        { type: 'vocabulary', word: 'dieciocho', meaning: 'eighteen' },
        { type: 'vocabulary', word: 'diecinueve', meaning: 'nineteen' },
        { type: 'vocabulary', word: 'veinte', meaning: 'twenty' },
        { type: 'text', text: 'Practice counting:' },
        { type: 'vocabulary', word: 'Uno, dos, tres, cuatro, cinco...', meaning: 'One, two, three, four, five...' },
      ],
    },
    4: {
      title: 'Colors',
      content: [
        { type: 'text', text: 'Colors are useful for describing objects, clothes, and surroundings.' },
        { type: 'vocabulary', word: 'rojo', meaning: 'red' },
        { type: 'vocabulary', word: 'azul', meaning: 'blue' },
        { type: 'vocabulary', word: 'verde', meaning: 'green' },
        { type: 'vocabulary', word: 'amarillo', meaning: 'yellow' },
        { type: 'vocabulary', word: 'negro', meaning: 'black' },
        { type: 'vocabulary', word: 'blanco', meaning: 'white' },
        { type: 'vocabulary', word: 'gris', meaning: 'gray' },
        { type: 'vocabulary', word: 'rosa', meaning: 'pink' },
        { type: 'vocabulary', word: 'morado', meaning: 'purple' },
        { type: 'vocabulary', word: 'naranja', meaning: 'orange' },
        { type: 'vocabulary', word: 'marrón', meaning: 'brown' },
        { type: 'text', text: 'Colors agree with gender in Spanish:' },
        { type: 'vocabulary', word: 'rojo/roja', meaning: 'red (masculine/feminine)' },
        { type: 'vocabulary', word: 'azul (invariable)', meaning: 'blue (same for both genders)' },
        { type: 'text', text: 'Example sentences:' },
        { type: 'vocabulary', word: 'La casa es roja.', meaning: 'The house is red.' },
        { type: 'vocabulary', word: 'El coche es azul.', meaning: 'The car is blue.' },
      ],
    },
    5: {
      title: 'Family & Relationships',
      content: [
        { type: 'text', text: 'Family vocabulary is important for conversations about relationships.' },
        { type: 'vocabulary', word: 'la familia', meaning: 'family' },
        { type: 'vocabulary', word: 'los padres', meaning: 'parents' },
        { type: 'vocabulary', word: 'el padre', meaning: 'father' },
        { type: 'vocabulary', word: 'la madre', meaning: 'mother' },
        { type: 'vocabulary', word: 'el hijo', meaning: 'son' },
        { type: 'vocabulary', word: 'la hija', meaning: 'daughter' },
        { type: 'vocabulary', word: 'el hermano', meaning: 'brother' },
        { type: 'vocabulary', word: 'la hermana', meaning: 'sister' },
        { type: 'vocabulary', word: 'el abuelo', meaning: 'grandfather' },
        { type: 'vocabulary', word: 'la abuela', meaning: 'grandmother' },
        { type: 'vocabulary', word: 'el tío', meaning: 'uncle' },
        { type: 'vocabulary', word: 'la tía', meaning: 'aunt' },
        { type: 'vocabulary', word: 'el primo', meaning: 'cousin (male)' },
        { type: 'vocabulary', word: 'la prima', meaning: 'cousin (female)' },
        { type: 'text', text: 'Example sentence:' },
        { type: 'vocabulary', word: 'Mi familia es grande. Tengo dos hermanos y una hermana.', meaning: 'My family is big. I have two brothers and one sister.' },
      ],
    },
  },
  arabic: {
    1: {
      title: 'Arabic Alphabet',
      content: [
        { type: 'text', text: 'The Arabic alphabet has 28 letters written from right to left. Here are the first few:' },
        { type: 'vocabulary', word: 'ا (alif)', pronunciation: 'a', meaning: 'a' },
        { type: 'vocabulary', word: 'ب (ba)', pronunciation: 'b', meaning: 'b' },
        { type: 'vocabulary', word: 'ت (ta)', pronunciation: 't', meaning: 't' },
        { type: 'vocabulary', word: 'ث (tha)', pronunciation: 'th', meaning: 'th (as in think)' },
        { type: 'vocabulary', word: 'ج (jim)', pronunciation: 'j', meaning: 'j (as in jam)' },
        { type: 'vocabulary', word: 'ح (ha)', pronunciation: 'h', meaning: 'h (throaty)' },
        { type: 'vocabulary', word: 'خ (kha)', pronunciation: 'kh', meaning: 'kh (like Bach)' },
        { type: 'vocabulary', word: 'د (dal)', pronunciation: 'd', meaning: 'd' },
        { type: 'vocabulary', word: 'ذ (dhal)', pronunciation: 'dh', meaning: 'dh (as in this)' },
        { type: 'vocabulary', word: 'ر (ra)', pronunciation: 'r', meaning: 'r (rolled)' },
        { type: 'vocabulary', word: 'ز (zay)', pronunciation: 'z', meaning: 'z' },
        { type: 'text', text: 'Arabic letters connect when written. The shape changes based on position:' },
        { type: 'vocabulary', word: 'بـ (initial)', pronunciation: 'ba', meaning: 'beginning of word' },
        { type: 'vocabulary', word: 'ـبـ (medial)', pronunciation: 'ba', meaning: 'middle of word' },
        { type: 'vocabulary', word: 'ـب (final)', pronunciation: 'ba', meaning: 'end of word' },
      ],
    },
    2: {
      title: 'Basic Greetings',
      content: [
        { type: 'text', text: 'Arabic greetings are warm and respectful. Here are the most common ones:' },
        { type: 'vocabulary', word: 'مرحبا', pronunciation: 'marhaba', meaning: 'hello/welcome' },
        { type: 'vocabulary', word: 'السلام عليكم', pronunciation: 'as-salamu alaykum', meaning: 'peace be upon you' },
        { type: 'vocabulary', word: 'وعليكم السلام', pronunciation: 'wa alaykumu as-salam', meaning: 'and upon you peace' },
        { type: 'vocabulary', word: 'صباح الخير', pronunciation: 'sabah al-khair', meaning: 'good morning' },
        { type: 'vocabulary', word: 'صباح النور', pronunciation: 'sabah an-noor', meaning: 'good morning (response)' },
        { type: 'vocabulary', word: 'مساء الخير', pronunciation: 'masa al-khair', meaning: 'good evening' },
        { type: 'vocabulary', word: 'مساء النور', pronunciation: 'masa an-noor', meaning: 'good evening (response)' },
        { type: 'vocabulary', word: 'كيف حالك؟', pronunciation: 'kayfa haluk?', meaning: 'how are you? (male)' },
        { type: 'vocabulary', word: 'كيف حالك؟', pronunciation: 'kayfa haluki?', meaning: 'how are you? (female)' },
        { type: 'vocabulary', word: 'الحمد لله', pronunciation: 'al-hamdu lillah', meaning: 'praise be to God (I\'m fine)' },
        { type: 'vocabulary', word: 'شكرا', pronunciation: 'shukran', meaning: 'thank you' },
        { type: 'vocabulary', word: 'عفوا', pronunciation: 'afwan', meaning: 'you\'re welcome' },
        { type: 'vocabulary', word: 'مع السلامة', pronunciation: 'ma\'a as-salama', meaning: 'goodbye' },
        { type: 'text', text: 'Practice this greeting exchange:' },
        { type: 'vocabulary', word: 'السلام عليكم. كيف حالك؟ الحمد لله، بخير. وأنت؟', meaning: 'Peace be upon you. How are you? Praise be to God, I\'m fine. And you?' },
      ],
    },
    3: {
      title: 'Numbers 1-10',
      content: [
        { type: 'text', text: 'Arabic numbers are essential for shopping, counting, and daily communication.' },
        { type: 'vocabulary', word: 'واحد', pronunciation: 'wahed', meaning: 'one' },
        { type: 'vocabulary', word: 'اثنان', pronunciation: 'ithnan', meaning: 'two' },
        { type: 'vocabulary', word: 'ثلاثة', pronunciation: 'thalatha', meaning: 'three' },
        { type: 'vocabulary', word: 'أربعة', pronunciation: 'arba\'a', meaning: 'four' },
        { type: 'vocabulary', word: 'خمسة', pronunciation: 'khamsa', meaning: 'five' },
        { type: 'vocabulary', word: 'ستة', pronunciation: 'sitta', meaning: 'six' },
        { type: 'vocabulary', word: 'سبعة', pronunciation: 'sab\'a', meaning: 'seven' },
        { type: 'vocabulary', word: 'ثمانية', pronunciation: 'thamaniya', meaning: 'eight' },
        { type: 'vocabulary', word: 'تسعة', pronunciation: 'tis\'a', meaning: 'nine' },
        { type: 'vocabulary', word: 'عشرة', pronunciation: 'ashara', meaning: 'ten' },
        { type: 'text', text: 'Numbers change form based on what they modify:' },
        { type: 'vocabulary', word: 'واحد كتاب (wahed kitab)', meaning: 'one book (masculine)' },
        { type: 'vocabulary', word: 'واحدة سيارة (wahida sayyara)', meaning: 'one car (feminine)' },
        { type: 'vocabulary', word: 'اثنان كتب (ithnan kutub)', meaning: 'two books' },
      ],
    },
    4: {
      title: 'Family Vocabulary',
      content: [
        { type: 'text', text: 'Family terms are important for introductions and conversations about relationships.' },
        { type: 'vocabulary', word: 'العائلة', pronunciation: 'al-\'aila', meaning: 'family' },
        { type: 'vocabulary', word: 'الأب', pronunciation: 'al-ab', meaning: 'father' },
        { type: 'vocabulary', word: 'الأم', pronunciation: 'al-umm', meaning: 'mother' },
        { type: 'vocabulary', word: 'الابن', pronunciation: 'al-ibn', meaning: 'son' },
        { type: 'vocabulary', word: 'البنت', pronunciation: 'al-bint', meaning: 'daughter' },
        { type: 'vocabulary', word: 'الأخ', pronunciation: 'al-akh', meaning: 'brother' },
        { type: 'vocabulary', word: 'الأخت', pronunciation: 'al-ukht', meaning: 'sister' },
        { type: 'vocabulary', word: 'الجد', pronunciation: 'al-jadd', meaning: 'grandfather' },
        { type: 'vocabulary', word: 'الجدة', pronunciation: 'al-jadda', meaning: 'grandmother' },
        { type: 'vocabulary', word: 'العم', pronunciation: 'al-\'amm', meaning: 'uncle (paternal)' },
        { type: 'vocabulary', word: 'الخال', pronunciation: 'al-khal', meaning: 'uncle (maternal)' },
        { type: 'vocabulary', word: 'العمه', pronunciation: 'al-\'amma', meaning: 'aunt (paternal)' },
        { type: 'vocabulary', word: 'الخالة', pronunciation: 'al-khala', meaning: 'aunt (maternal)' },
        { type: 'text', text: 'Example sentence:' },
        { type: 'vocabulary', word: 'عائلتي كبيرة ولدي ثلاثة إخوة وأختان', meaning: 'My family is big and I have three brothers and two sisters' },
      ],
    },
    5: {
      title: 'Food & Drink',
      content: [
        { type: 'text', text: 'Food vocabulary is useful for ordering at restaurants and shopping.' },
        { type: 'vocabulary', word: 'الطعام', pronunciation: 'at-ta\'am', meaning: 'food' },
        { type: 'vocabulary', word: 'الشراب', pronunciation: 'ash-sharab', meaning: 'drink' },
        { type: 'vocabulary', word: 'الماء', pronunciation: 'al-ma\'', meaning: 'water' },
        { type: 'vocabulary', word: 'الشاي', pronunciation: 'ash-shai', meaning: 'tea' },
        { type: 'vocabulary', word: 'القهوة', pronunciation: 'al-qahwa', meaning: 'coffee' },
        { type: 'vocabulary', word: 'الخبز', pronunciation: 'al-khubz', meaning: 'bread' },
        { type: 'vocabulary', word: 'الأرز', pronunciation: 'al-arz', meaning: 'rice' },
        { type: 'vocabulary', word: 'اللحم', pronunciation: 'al-lahm', meaning: 'meat' },
        { type: 'vocabulary', word: 'السمك', pronunciation: 'as-samak', meaning: 'fish' },
        { type: 'vocabulary', word: 'الخضار', pronunciation: 'al-khudar', meaning: 'vegetables' },
        { type: 'vocabulary', word: 'الفواكه', pronunciation: 'al-fawakeh', meaning: 'fruits' },
        { type: 'vocabulary', word: 'التفاح', pronunciation: 'at-tuffah', meaning: 'apple' },
        { type: 'vocabulary', word: 'الموز', pronunciation: 'al-mawz', meaning: 'banana' },
        { type: 'vocabulary', word: 'الحليب', pronunciation: 'al-haleeb', meaning: 'milk' },
        { type: 'text', text: 'Common phrases:' },
        { type: 'vocabulary', word: 'أريد ماء', pronunciation: 'ureedu ma\'', meaning: 'I want water' },
        { type: 'vocabulary', word: 'الطعام لذيذ', pronunciation: 'at-ta\'am ladheedh', meaning: 'the food is delicious' },
      ],
    },
  },
};

export default function LessonScreen() {
  const { language, lessonId } = useLocalSearchParams();
  const router = useRouter();

  const langContent = lessonContent[language as keyof typeof lessonContent];
  const content = langContent ? langContent[parseInt(lessonId as string) as keyof typeof langContent] : null;

  if (!content) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">Lesson not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const completeLesson = async () => {
    try {
      // Mark lesson as complete
      await DataService.markLessonComplete(language as string, parseInt(lessonId as string), 10); // 10 minutes study time

      Alert.alert(
        'Lesson Complete!',
        'Great job! You\'ve finished this lesson.',
        [
          { text: 'Next Lesson', onPress: () => router.back() },
          { text: 'Back to Lessons', onPress: () => router.push(`/lessons/${language}`) },
        ]
      );
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.titleWithAudio}>
            <ThemedText type="title" style={styles.title}>
              {content.title}
            </ThemedText>
            <AudioButton
              text={content.title}
              language={language as string}
              size={24}
            />
          </ThemedView>
        </ThemedView>

        {content.content.map((item: any, index: number) => (
          <ThemedView key={index} style={styles.contentItem}>
            {item.type === 'text' ? (
              <ThemedView style={styles.textWithAudio}>
                <ThemedText style={styles.textContent}>{item.text}</ThemedText>
                <AudioButton
                  text={item.text}
                  language={language as string}
                  size={20}
                />
              </ThemedView>
            ) : (
              <ThemedView style={styles.vocabularyItem}>
                <ThemedView style={styles.wordWithAudio}>
                  <ThemedText type="subtitle" style={styles.word}>
                    {item.word}
                  </ThemedText>
                  <AudioButton
                    text={item.word}
                    language={language as string}
                    size={22}
                  />
                </ThemedView>
                {item.romaji && (
                  <ThemedView style={styles.romajiWithAudio}>
                    <ThemedText style={styles.romaji}>{item.romaji}</ThemedText>
                    <AudioButton
                      text={item.romaji}
                      language={language as string}
                      size={18}
                    />
                  </ThemedView>
                )}
                {item.pronunciation && (
                  <ThemedText style={styles.pronunciation}>
                    Pronunciation: {item.pronunciation}
                  </ThemedText>
                )}
                {item.example && (
                  <ThemedView style={styles.exampleWithAudio}>
                    <ThemedText style={styles.example}>Example: {item.example}</ThemedText>
                    <AudioButton
                      text={item.example}
                      language={language as string}
                      size={18}
                    />
                  </ThemedView>
                )}
                <ThemedView style={styles.meaningContainer}>
                  <ThemedText style={styles.meaning}>
                    {item.meaning}
                  </ThemedText>
                  {/* Don't show audio for English meanings */}
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.completeButton} onPress={completeLesson}>
          <ThemedText type="subtitle" style={styles.buttonText}>
            Complete Lesson
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  titleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    marginBottom: 10,
  },
  contentItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
  },
  textWithAudio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  vocabularyItem: {
    marginBottom: 15,
  },
  wordWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  word: {
    fontSize: 20,
    marginBottom: 5,
    flex: 1,
  },
  romajiWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  romaji: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
    flex: 1,
  },
  pronunciation: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  exampleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  example: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
    flex: 1,
  },
  meaningContainer: {
    marginTop: 5,
  },
  meaning: {
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
