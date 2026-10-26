import type { GrammarPoint } from './types';

/** Original examples and questions; level labels are representative, not official. */
export const timeReasonGrammar: GrammarPoint[] = [
  {
    "id": "grammar-uchini",
    "pattern": "～うちに",
    "category": "時間與進程",
    "meaning": "趁著……；在……的過程中",
    "connection": [
      "動詞辭書形／ない形＋うちに",
      "動詞ている形＋うちに",
      "い形容詞＋うちに；な形容詞＋なうちに；名詞＋のうちに"
    ],
    "explanation": "表示趁某個狀態仍持續時做某事，避免錯過機會；也可表示在持續進行某事的過程中，不知不覺出現變化。",
    "caution": "「趁……」用法通常預期該狀態會改變。「話しているうちに慣れた」則重點在過程中的變化，不一定是有意趁機行動。",
    "examples": [
      {
        "japanese": "[温|あたた]かいうちに、スープを[飲|の]みましょう。",
        "translation": "趁湯還溫熱時喝吧。"
      },
      {
        "japanese": "[毎日|まいにち][日本語|にほんご]を[話|はな]しているうちに、[少|すこ]しずつ[慣|な]れてきました。",
        "translation": "每天說日文的過程中，我漸漸習慣了。"
      }
    ],
    "questions": [
      {
        "id": "grammar-uchini-q1",
        "kind": "meaning",
        "instruction": "這句話建議在什麼時候回家？",
        "japanese": "[明|あか]るいうちに、[家|いえ]に[帰|かえ]りましょう。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "趁天還亮的時候回家。",
            "explanation": "「明るいうちに」表示趁明亮的狀態仍持續時。"
          },
          {
            "id": "b",
            "text": "等天黑後再回家。",
            "explanation": "這與趁天還亮時的意思相反。"
          },
          {
            "id": "c",
            "text": "每次天亮就一定要回家。",
            "explanation": "「うちに」不表示每次都發生。"
          },
          {
            "id": "d",
            "text": "因為家裡明亮，所以回家。",
            "explanation": "這裡的「明るい」描述回家前的天色，不是回家的原因。"
          }
        ],
        "answerId": "a",
        "explanation": "「うちに」把行動放在某個狀態改變之前；此處是天還亮的時段。"
      },
      {
        "id": "grammar-uchini-q2",
        "kind": "connection",
        "instruction": "用「うちに」表達「趁年輕」，選出符合標準接續的形式。",
        "japanese": "[若|わか]い（　）、いろいろな[国|くに]へ[行|い]ってみたいです。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "うちに",
            "explanation": "い形容詞「若い」直接接「うちに」。"
          },
          {
            "id": "b",
            "text": "のうちに",
            "explanation": "名詞才用「のうちに」，不能接在「若い」後。"
          },
          {
            "id": "c",
            "text": "なうちに",
            "explanation": "な形容詞才用「なうちに」。"
          },
          {
            "id": "d",
            "text": "をうちに",
            "explanation": "「うちに」前不以「を」連接形容詞。"
          }
        ],
        "answerId": "a",
        "explanation": "い形容詞保持原形，接「うちに」：若いうちに。",
        "translation": "我想趁年輕時去各種不同的國家看看。"
      },
      {
        "id": "grammar-uchini-q3",
        "kind": "usage",
        "instruction": "哪個情境最符合這句話的用意？",
        "japanese": "[熱|あつ]いうちに、[食|た]べてください。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "食物可能會變冷，所以希望對方現在趁熱吃。",
            "explanation": "趁熱的狀態還沒改變時吃，符合「うちに」。"
          },
          {
            "id": "b",
            "text": "食物已經冷了，要先放著等它自然變熱。",
            "explanation": "句子並未表示等待變熱。"
          },
          {
            "id": "c",
            "text": "每吃一次，就會再把食物加熱一次。",
            "explanation": "這是反覆發生的關係，不是「うちに」的重點。"
          },
          {
            "id": "d",
            "text": "食物越熱，就越不能吃。",
            "explanation": "原句是在邀請趁熱吃，並非否定吃的可能。"
          }
        ],
        "answerId": "a",
        "explanation": "「熱いうちに」指出應把握的短暫狀態；不是重複次數或因果關係。"
      }
    ]
  },
  {
    "id": "grammar-tabini",
    "pattern": "～たびに",
    "category": "時間與進程",
    "meaning": "每當……就……；每次……都……",
    "connection": [
      "動詞辭書形＋たびに",
      "名詞＋のたびに"
    ],
    "explanation": "表示每次發生前項事件，都會伴隨後項情況。常用來描述經驗、感受或有意識的行動。",
    "caution": "不是只發生一次的先後順序。一般固定的自然規律或日常生理反應，通常用「と」更自然；此處先練習帶有經驗性的事件。",
    "examples": [
      {
        "japanese": "[出張|しゅっちょう]のたびに、[家族|かぞく]にお[土産|みやげ]を[買|か]います。",
        "translation": "每次出差，我都會買伴手禮給家人。"
      },
      {
        "japanese": "この[写真|しゃしん]を[見|み]るたびに、[学生時代|がくせいじだい]を[思|おも]い[出|だ]します。",
        "translation": "每次看到這張照片，我都會想起學生時代。"
      }
    ],
    "questions": [
      {
        "id": "grammar-tabini-q1",
        "kind": "meaning",
        "instruction": "下列哪個說明符合這句話？",
        "japanese": "この[本|ほん]を[読|よ]むたびに、[新|あたら]しい[発見|はっけん]があります。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "只讀過一次，而且沒有發現新事物。",
            "explanation": "句子描述每次閱讀都有新發現。"
          },
          {
            "id": "b",
            "text": "每次閱讀這本書，都有新的發現。",
            "explanation": "「読むたびに」表示每次閱讀都伴隨新發現。"
          },
          {
            "id": "c",
            "text": "讀完所有書以後，才會有一次發現。",
            "explanation": "「この本」是特定一本書，且不是所有書讀完後才發生。"
          },
          {
            "id": "d",
            "text": "因為有新發現，所以不再讀這本書。",
            "explanation": "句中沒有停止閱讀的意思。"
          }
        ],
        "answerId": "b",
        "explanation": "「たびに」連結反覆發生的事件：每次讀，都有新發現。"
      },
      {
        "id": "grammar-tabini-q2",
        "kind": "connection",
        "instruction": "用「たびに」接在名詞「旅行」後，選出正確形式。",
        "japanese": "[旅行|りょこう]（　）、[新|あたら]しい[友人|ゆうじん]ができます。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "たびに",
            "explanation": "名詞「旅行」後需要「の」。"
          },
          {
            "id": "b",
            "text": "なたびに",
            "explanation": "「旅行」是名詞，此處不用「な」。"
          },
          {
            "id": "c",
            "text": "のたびに",
            "explanation": "名詞接「のたびに」：旅行のたびに。"
          },
          {
            "id": "d",
            "text": "をたびに",
            "explanation": "「を」不能直接把名詞接到「たびに」。"
          }
        ],
        "answerId": "c",
        "explanation": "名詞的接續是「名詞＋のたびに」。",
        "translation": "每次旅行，都會交到新朋友。"
      },
      {
        "id": "grammar-tabini-q3",
        "kind": "usage",
        "instruction": "哪個說明最符合句中的反覆關係？",
        "japanese": "[祖母|そぼ]に[会|あ]うたびに、[昔|むかし]の[話|はなし]を[聞|き]かせてもらいます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "只要見到祖母，就每次都會聽她說往事。",
            "explanation": "見祖母與聽往事之間有每次都成立的關係。"
          },
          {
            "id": "b",
            "text": "第一次見祖母前，已經聽完所有往事。",
            "explanation": "沒有第一次見面前的意思。"
          },
          {
            "id": "c",
            "text": "這次第一次聽祖母說往事，之後不會再見。",
            "explanation": "原句描述的是反覆發生，不是唯一一次。"
          },
          {
            "id": "d",
            "text": "因為不想聽往事，所以不見祖母。",
            "explanation": "句子沒有否定或避免見面的意思。"
          }
        ],
        "answerId": "a",
        "explanation": "「会うたびに」不是單次的「見面時」，而是每次見面都有相同經驗。"
      }
    ]
  },
  {
    "id": "grammar-saichuuni",
    "pattern": "～最中に",
    "category": "時間與進程",
    "meaning": "正在……的時候；正當……時",
    "connection": [
      "動詞ている形＋最中に",
      "名詞＋の最中に"
    ],
    "explanation": "強調某活動正在進行的當下。後面常接打斷活動、出乎意料或不方便的事件。",
    "caution": "重點是活動正在進行，而非剛做完或尚未開始。「最中に」常用於持續一段時間的活動，不適合只有瞬間的狀態。",
    "examples": [
      {
        "japanese": "[食事|しょくじ]の[最中|さいちゅう]に、[電話|でんわ]がかかってきました。",
        "translation": "正在吃飯時，電話打來了。"
      },
      {
        "japanese": "[会議|かいぎ]をしている[最中|さいちゅう]に、[停電|ていでん]しました。",
        "translation": "正在開會時，停電了。"
      }
    ],
    "questions": [
      {
        "id": "grammar-saichuuni-q1",
        "kind": "meaning",
        "instruction": "電話打來時，說話者正在做什麼？",
        "japanese": "お[風呂|ふろ]に[入|はい]っている[最中|さいちゅう]に、[電話|でんわ]が[鳴|な]りました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "還沒有準備洗澡。",
            "explanation": "「入っている最中に」表示已在洗澡。"
          },
          {
            "id": "b",
            "text": "剛剛洗完澡。",
            "explanation": "剛結束可用「入ったところ」，與正在進行不同。"
          },
          {
            "id": "c",
            "text": "正在洗澡。",
            "explanation": "「最中に」強調動作進行當中。"
          },
          {
            "id": "d",
            "text": "打完電話後才去洗澡。",
            "explanation": "原句是洗澡中電話響了，先後關係不同。"
          }
        ],
        "answerId": "c",
        "explanation": "動詞ている形＋最中に，將後項事件放在前項活動正進行的時間點。"
      },
      {
        "id": "grammar-saichuuni-q2",
        "kind": "connection",
        "instruction": "用「最中に」強調「正在做菜」，選出正確接續。",
        "japanese": "[料理|りょうり]を（　）、[友人|ゆうじん]が[来|き]ました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "して[最中|さいちゅう]に",
            "explanation": "此處需「している」再接「最中に」，不能只有て形。"
          },
          {
            "id": "b",
            "text": "します[最中|さいちゅう]に",
            "explanation": "丁寧形「します」不能直接修飾「最中」。"
          },
          {
            "id": "c",
            "text": "しの[最中|さいちゅう]に",
            "explanation": "動詞的ます形詞幹不以「の」接「最中」。"
          },
          {
            "id": "d",
            "text": "している[最中|さいちゅう]に",
            "explanation": "「している最中に」正確表達動作正在進行。"
          }
        ],
        "answerId": "d",
        "explanation": "表達正在進行的動作，使用「動詞ている形＋最中に」。",
        "translation": "正在做菜時，朋友來了。"
      },
      {
        "id": "grammar-saichuuni-q3",
        "kind": "usage",
        "instruction": "哪個時間關係符合這句話？",
        "japanese": "[試験|しけん]の[最中|さいちゅう]に、[外|そと]で[大|おお]きな[音|おと]がしました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "考試開始前，外面先傳來聲音。",
            "explanation": "「最中」不是開始之前。"
          },
          {
            "id": "b",
            "text": "考試正在進行時，外面傳來很大的聲音。",
            "explanation": "名詞「試験」接「の最中に」，指考試進行中。"
          },
          {
            "id": "c",
            "text": "考試結束很久以後，外面才出現聲音。",
            "explanation": "與活動正進行的時間不符。"
          },
          {
            "id": "d",
            "text": "因為外面安靜，所以取消考試。",
            "explanation": "原句沒有取消，也不是安靜。"
          }
        ],
        "answerId": "b",
        "explanation": "「試験の最中に」把聲音定位在考試進行期間，常帶有打擾的感覺。"
      }
    ]
  },
  {
    "id": "grammar-tokoroni",
    "pattern": "～ところに",
    "category": "時間與進程",
    "meaning": "正當……的時候，碰巧……",
    "connection": [
      "動詞辭書形＋ところに（正要做某事時）",
      "動詞ている形＋ところに",
      "動詞た形＋ところに",
      "動詞意向形＋としているところに"
    ],
    "explanation": "描述正處於某個動作階段時，另一個事件進入這個情境。常接「人が来る」「電話がかかる」等到來或打斷情境的事件。",
    "caution": "「ところ」在此表示時間上的階段，不是實際地點。「ところに」與後項的到來事件配合；不能將「に」任意替換成任何助詞。",
    "examples": [
      {
        "japanese": "[出|で]かけるところに、[宅配便|たくはいびん]が[届|とど]きました。",
        "translation": "正要出門時，宅配送到了。"
      },
      {
        "japanese": "ちょうど[昼|ひる]ご[飯|はん]を[食|た]べているところに、[友人|ゆうじん]が[来|き]ました。",
        "translation": "正好在吃午餐時，朋友來了。"
      }
    ],
    "questions": [
      {
        "id": "grammar-tokoroni-q1",
        "kind": "meaning",
        "instruction": "母親是在什麼時候打電話來的？",
        "japanese": "[家|いえ]を[出|で]ようとしているところに、[母|はは]から[電話|でんわ]がありました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者正準備離開家的時候。",
            "explanation": "「出ようとしているところに」表示正要出門的階段。"
          },
          {
            "id": "b",
            "text": "說話者已離家好幾天的時候。",
            "explanation": "句子說正要離家，不是很久以前已出門。"
          },
          {
            "id": "c",
            "text": "說話者正在替母親找住處的時候。",
            "explanation": "「ところ」是動作階段，不是住處。"
          },
          {
            "id": "d",
            "text": "說話者打電話給母親之後，母親才回家。",
            "explanation": "主語與事件方向、先後都與原句不同。"
          }
        ],
        "answerId": "a",
        "explanation": "「意向形＋としているところに」常表示正要採取行動時，另一事件到來。"
      },
      {
        "id": "grammar-tokoroni-q2",
        "kind": "connection",
        "instruction": "用「ところに」表達朋友恰好在此時到來，選出完整接續。",
        "japanese": "[出|で]かけようとしている（　）、[友人|ゆうじん]が[来|き]ました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "ところの",
            "explanation": "「ところの」不能直接連到後面的獨立事件。"
          },
          {
            "id": "b",
            "text": "ところな",
            "explanation": "「ところ」在此不用「な」接後句。"
          },
          {
            "id": "c",
            "text": "ところに",
            "explanation": "「ところに」可接另一事件或人物的到來。"
          },
          {
            "id": "d",
            "text": "ところを",
            "explanation": "「ところを」常接「呼び止める」等對場面中的人施加作用的表達；本句是朋友到來的時間點，應用「ところに」。"
          }
        ],
        "answerId": "c",
        "explanation": "這個題目指定以「ところに」描述正要出門時朋友到來。",
        "translation": "正要出門時，朋友來了。"
      },
      {
        "id": "grammar-tokoroni-q3",
        "kind": "usage",
        "instruction": "哪個說明符合這句話的情境？",
        "japanese": "[仕事|しごと]が[終|お]わったところに、[友人|ゆうじん]から[電話|でんわ]がかかってきました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "工作還沒開始，所以一直等朋友打來。",
            "explanation": "「終わった」表示工作已結束。"
          },
          {
            "id": "b",
            "text": "剛結束工作時，朋友碰巧打電話來。",
            "explanation": "「終わったところに」表示剛完成這個階段時有另一事件到來。"
          },
          {
            "id": "c",
            "text": "因為朋友打電話來，才決定明天開始工作。",
            "explanation": "原句未提明天或開始工作的決定。"
          },
          {
            "id": "d",
            "text": "工作進行了一半，朋友來公司接人。",
            "explanation": "電話不是人到公司，且工作已完成。"
          }
        ],
        "answerId": "b",
        "explanation": "「た形＋ところに」可將後項事件放在前項剛完成的時點；不要一律解讀為正在進行。"
      }
    ]
  },
  {
    "id": "grammar-tsuideni",
    "pattern": "～ついでに",
    "category": "時間與進程",
    "meaning": "趁著做……，順便……",
    "connection": [
      "動詞辭書形／た形＋ついでに",
      "名詞＋のついでに"
    ],
    "explanation": "以前項為主要行動，利用相同機會順便完成另一件事。後項通常是比較附帶、順手的行動。",
    "caution": "不是兩件事都同樣重要的單純並列，也不是表示每次必然發生。若主要目的只是後項，就不宜把它說成順便。",
    "examples": [
      {
        "japanese": "[買|か]い[物|もの]のついでに、[郵便局|ゆうびんきょく]に[寄|よ]りました。",
        "translation": "購物時，我順便去了郵局。"
      },
      {
        "japanese": "[駅|えき]まで[友人|ゆうじん]を[迎|むか]えに[行|い]くついでに、スーパーで[牛乳|ぎゅうにゅう]を[買|か]います。",
        "translation": "去車站接朋友時，我會順便到超市買牛奶。"
      }
    ],
    "questions": [
      {
        "id": "grammar-tsuideni-q1",
        "kind": "meaning",
        "instruction": "這句話中，寄明信片是哪一種行動？",
        "japanese": "[散歩|さんぽ]のついでに、はがきを[出|だ]しました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "散步時利用機會順便做的事。",
            "explanation": "「散歩」是主要行動，寄明信片是附帶行動。"
          },
          {
            "id": "b",
            "text": "散步前必須通過的考試。",
            "explanation": "沒有必要條件或考試的意思。"
          },
          {
            "id": "c",
            "text": "取代散步而進行的唯一活動。",
            "explanation": "「ついでに」不是替代前項。"
          },
          {
            "id": "d",
            "text": "每走一步就重複一次的動作。",
            "explanation": "不是表示每次或每一步都發生。"
          }
        ],
        "answerId": "a",
        "explanation": "「AのついでにB」把A當作主要行動，B是利用同一機會順便做的事。"
      },
      {
        "id": "grammar-tsuideni-q2",
        "kind": "connection",
        "instruction": "名詞「散歩」後要接「ついでに」，哪一項正確？",
        "japanese": "[散歩|さんぽ]（　）、[近|ちか]くの[店|みせ]でパンを[買|か]いました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "なついでに",
            "explanation": "名詞「散歩」後應用「の」，不是「な」。"
          },
          {
            "id": "b",
            "text": "のついでに",
            "explanation": "名詞＋のついでに，符合此處接續。"
          },
          {
            "id": "c",
            "text": "をついでに",
            "explanation": "不能用「を」把名詞直接接到「ついでに」。"
          },
          {
            "id": "d",
            "text": "でついでに",
            "explanation": "此處的名詞修飾接續是「のついでに」。"
          }
        ],
        "answerId": "b",
        "explanation": "名詞後用「のついでに」；動詞辭書形或た形則直接接「ついでに」。",
        "translation": "散步時，我順便到附近的店買了麵包。"
      },
      {
        "id": "grammar-tsuideni-q3",
        "kind": "usage",
        "instruction": "下列哪個中文說明符合「ついでに」的主次關係？",
        "japanese": "[銀行|ぎんこう]へ[行|い]くついでに、[隣|となり]の[郵便局|ゆうびんきょく]で[手紙|てがみ]を[出|だ]します。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "唯一目的就是寄信，所以完全不去銀行。",
            "explanation": "前項「銀行へ行く」是實際的主要行動，不是被取消的事。"
          },
          {
            "id": "b",
            "text": "必須先寄出信，銀行才會開門。",
            "explanation": "「ついでに」不表示必要條件。"
          },
          {
            "id": "c",
            "text": "銀行和郵局每天都會同時關門。",
            "explanation": "這不是句中的行動主次關係。"
          },
          {
            "id": "d",
            "text": "主要去銀行辦事，並順便到隔壁郵局寄信。",
            "explanation": "去銀行是主行動，寄信是順便做的附帶行動。"
          }
        ],
        "answerId": "d",
        "explanation": "判斷「ついでに」時，要辨認哪件事是主要行程，哪件事是附帶完成。"
      }
    ]
  },
  {
    "id": "grammar-okagede",
    "pattern": "～おかげで",
    "category": "原因與判斷",
    "meaning": "多虧……；因為……而有好結果",
    "connection": [
      "動詞普通形／い形容詞＋おかげで",
      "な形容詞＋なおかげで；名詞＋のおかげで"
    ],
    "explanation": "提出帶來好結果的原因，常含感謝或正面評價。原因可以是人的協助，也可以是努力、條件或事件。",
    "caution": "一般先用於好結果。也有反語的「都拜你所賜」，但要依語氣判斷，不宜當成初學時的預設用法。",
    "examples": [
      {
        "japanese": "[先生|せんせい]が[丁寧|ていねい]に[説明|せつめい]してくれたおかげで、よく[分|わ]かりました。",
        "translation": "多虧老師仔細說明，我理解得很清楚。"
      },
      {
        "japanese": "[友人|ゆうじん]のおかげで、[引|ひ]っ[越|こ]しが[早|はや]く[終|お]わりました。",
        "translation": "多虧朋友幫忙，搬家很快就結束了。"
      }
    ],
    "questions": [
      {
        "id": "grammar-okagede-q1",
        "kind": "meaning",
        "instruction": "這句話對事前練習抱持什麼評價？",
        "japanese": "よく[練習|れんしゅう]したおかげで、[落|お]ち[着|つ]いて[発表|はっぴょう]できました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "認為練習害自己無法報告。",
            "explanation": "結果是能冷靜報告，不是無法報告。"
          },
          {
            "id": "b",
            "text": "認為充分練習帶來了好的結果。",
            "explanation": "「おかげで」把充分練習評價為正面原因。"
          },
          {
            "id": "c",
            "text": "認為練習和報告毫無關係。",
            "explanation": "此句明確表示因果關係。"
          },
          {
            "id": "d",
            "text": "認為報告後才第一次開始練習。",
            "explanation": "先練習，才有能冷靜報告的結果。"
          }
        ],
        "answerId": "b",
        "explanation": "「おかげで」在此表示感謝或肯定前項原因，後項是期望的好結果。"
      },
      {
        "id": "grammar-okagede-q2",
        "kind": "connection",
        "instruction": "名詞「先生」後接「おかげで」，選出標準接續。",
        "japanese": "[先生|せんせい]（　）、[難|むずか]しい[文法|ぶんぽう]が[分|わ]かりました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をおかげで",
            "explanation": "「おかげ」是名詞性表達，此處不用「を」連接原因。"
          },
          {
            "id": "b",
            "text": "なおかげで",
            "explanation": "名詞「先生」後用「の」，不是な形容詞接續。"
          },
          {
            "id": "c",
            "text": "のおかげで",
            "explanation": "名詞＋のおかげで：先生のおかげで。"
          },
          {
            "id": "d",
            "text": "におかげで",
            "explanation": "此處不能以「に」把名詞接到「おかげ」。"
          }
        ],
        "answerId": "c",
        "explanation": "「先生のおかげで」表示多虧老師，名詞後需接「の」。",
        "translation": "多虧老師，我理解了困難的文法。"
      },
      {
        "id": "grammar-okagede-q3",
        "kind": "usage",
        "instruction": "哪個說明符合說話者使用「おかげで」的心情？",
        "japanese": "[友人|ゆうじん]が[手伝|てつだ]ってくれたおかげで、[締|し]め[切|き]りに[間|ま]に[合|あ]いました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "感謝朋友幫忙，讓自己趕上期限。",
            "explanation": "朋友的幫忙帶來趕上期限的好結果。"
          },
          {
            "id": "b",
            "text": "責怪朋友幫忙，害自己錯過期限。",
            "explanation": "「間に合いました」是趕上了，不是錯過了。"
          },
          {
            "id": "c",
            "text": "表示朋友有沒有幫忙都完全一樣。",
            "explanation": "句子把朋友的協助列為好結果的原因。"
          },
          {
            "id": "d",
            "text": "要求朋友下次一定要延長期限。",
            "explanation": "沒有要求未來延長期限的意思。"
          }
        ],
        "answerId": "a",
        "explanation": "此處的「おかげで」不是反語，而是對協助者的正面感謝。"
      }
    ]
  },
  {
    "id": "grammar-seide",
    "pattern": "～せいで",
    "category": "原因與判斷",
    "meaning": "因為……而造成壞結果；都怪……",
    "connection": [
      "動詞普通形／い形容詞＋せいで",
      "な形容詞＋なせいで；名詞＋のせいで"
    ],
    "explanation": "把前項看作不理想結果的原因，常帶責怪、遺憾或負面評價。原因可以是人、事件或狀況。",
    "caution": "通常不用來真誠感謝好結果；不確定原因時常改用「せいか」。對人使用可能帶有指責，需留意語氣。",
    "examples": [
      {
        "japanese": "[電車|でんしゃ]が[遅|おく]れたせいで、[面接|めんせつ]に[遅刻|ちこく]しました。",
        "translation": "因為電車誤點，我面試遲到了。"
      },
      {
        "japanese": "[寝不足|ねぶそく]のせいで、[授業|じゅぎょう]に[集中|しゅうちゅう]できません。",
        "translation": "因為睡眠不足，我無法專心上課。"
      }
    ],
    "questions": [
      {
        "id": "grammar-seide-q1",
        "kind": "meaning",
        "instruction": "這句話把什麼當成睡過頭的原因？",
        "japanese": "[夜更|よふ]かししたせいで、[朝|あさ][寝坊|ねぼう]しました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "早起，帶來說話者感謝的結果。",
            "explanation": "原句是熬夜後睡過頭，是負面結果。"
          },
          {
            "id": "b",
            "text": "睡過頭後才開始熬夜。",
            "explanation": "因果順序相反。"
          },
          {
            "id": "c",
            "text": "熬夜，帶來不理想的結果。",
            "explanation": "「せいで」將熬夜視為睡過頭的原因。"
          },
          {
            "id": "d",
            "text": "只是在猜測，並未判斷任何原因。",
            "explanation": "「せいで」已指出原因；不確定時可用「せいか」。"
          }
        ],
        "answerId": "c",
        "explanation": "「せいで」在此把熬夜和睡過頭連成負面因果關係。"
      },
      {
        "id": "grammar-seide-q2",
        "kind": "connection",
        "instruction": "用「せいで」接在名詞「雨」後，選出正確形式。",
        "japanese": "[雨|あめ]（　）、[試合|しあい]が[中止|ちゅうし]になりました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "のせいで",
            "explanation": "名詞＋のせいで：雨のせいで。"
          },
          {
            "id": "b",
            "text": "なせいで",
            "explanation": "名詞「雨」後不能使用な形容詞接續。"
          },
          {
            "id": "c",
            "text": "をせいで",
            "explanation": "「せいで」前不以「を」連接名詞原因。"
          },
          {
            "id": "d",
            "text": "にせいで",
            "explanation": "此處需要「の」，不是「に」。"
          }
        ],
        "answerId": "a",
        "explanation": "名詞接「のせいで」，表示把名詞所代表的事情視為壞結果的原因。",
        "translation": "因為下雨，比賽取消了。"
      },
      {
        "id": "grammar-seide-q3",
        "kind": "usage",
        "instruction": "這句話主要表達哪種因果評價？",
        "japanese": "[道路|どうろ]が[混|こ]んでいたせいで、[約束|やくそく]の[時間|じかん]に[遅|おく]れました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "因為道路擁擠而遲到，覺得結果不理想。",
            "explanation": "堵塞是原因，遲到是說話者不希望的結果。"
          },
          {
            "id": "b",
            "text": "感謝道路擁擠，讓自己準時抵達。",
            "explanation": "原句是遲到，不是準時抵達。"
          },
          {
            "id": "c",
            "text": "為了道路變擁擠，刻意選擇遲到。",
            "explanation": "「せいで」不是目的表達。"
          },
          {
            "id": "d",
            "text": "道路越擁擠，約定的時間就越早。",
            "explanation": "句子沒有比例變化的關係。"
          }
        ],
        "answerId": "a",
        "explanation": "負面原因可接「せいで」；若是感謝協助而趕上時間，才常用「おかげで」。"
      }
    ]
  },
  {
    "id": "grammar-hazuda",
    "pattern": "～はずだ",
    "category": "原因與判斷",
    "meaning": "照理應該……；按道理會……",
    "connection": [
      "動詞普通形／い形容詞＋はずだ",
      "な形容詞＋なはずだ；名詞＋のはずだ"
    ],
    "explanation": "根據已知事實、規則、計畫或線索，推斷某事照理應成立。說話者有推論依據，但不等於親自確認了事實。",
    "caution": "不是表示義務的「應該去做」，也不是單純願望。預期可能與實際不同；「はずだった」需依上下文判斷原本預期與後來的結果。",
    "examples": [
      {
        "japanese": "[三時|さんじ]に[出発|しゅっぱつ]したので、もうすぐ[着|つ]くはずです。",
        "translation": "因為三點已經出發，照理應該快到了。"
      },
      {
        "japanese": "[今日|きょう]は[祝日|しゅくじつ]だから、[銀行|ぎんこう]は[休|やす]みのはずです。",
        "translation": "今天是國定假日，所以銀行照理應該休息。"
      }
    ],
    "questions": [
      {
        "id": "grammar-hazuda-q1",
        "kind": "meaning",
        "instruction": "說話者對田中是否在公司的判斷是什麼？",
        "japanese": "[予定表|よていひょう]では[今日|きょう]は[出勤日|しゅっきんび]なので、[田中|たなか]さんは[会社|かいしゃ]にいるはずです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "已親眼看到田中在公司，毫無推論成分。",
            "explanation": "原句只說根據班表推斷，沒有說親眼確認。"
          },
          {
            "id": "b",
            "text": "希望田中以後能找到公司。",
            "explanation": "不是願望，也不是找公司。"
          },
          {
            "id": "c",
            "text": "命令田中現在立刻去公司。",
            "explanation": "「はずです」不是對他人的命令。"
          },
          {
            "id": "d",
            "text": "根據班表，推斷田中照理應該在公司。",
            "explanation": "班表提供推論依據，符合「はずだ」。"
          }
        ],
        "answerId": "d",
        "explanation": "「はずだ」表示有根據的預期，不能直接當作已經證實的事實。"
      },
      {
        "id": "grammar-hazuda-q2",
        "kind": "connection",
        "instruction": "用「はず」表達依文件做出的推斷；名詞「会社員」後接哪一項？",
        "japanese": "[書類|しょるい]では、あの[人|ひと]は[会社員|かいしゃいん]（　）です。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をはず",
            "explanation": "「を」不能用來把名詞接到「はず」。"
          },
          {
            "id": "b",
            "text": "のはず",
            "explanation": "名詞＋のはずだ，此處用丁寧形「です」。"
          },
          {
            "id": "c",
            "text": "にはず",
            "explanation": "這裡不是名詞＋に的接續。"
          },
          {
            "id": "d",
            "text": "ではず",
            "explanation": "「会社員ではず」不是此文法的接續。"
          }
        ],
        "answerId": "b",
        "explanation": "名詞在「はずだ」前使用「の」：会社員のはずです。",
        "translation": "依文件記載，那個人照理應該是公司職員。"
      },
      {
        "id": "grammar-hazuda-q3",
        "kind": "usage",
        "instruction": "下列哪個中文解讀最符合說話者的推論？",
        "japanese": "[時刻表|じこくひょう]によると、バスはあと[五分|ごふん]で[来|く]るはずです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "根據時刻表，預期公車五分鐘後會到。",
            "explanation": "時刻表是推斷依據，「はず」表示預期。"
          },
          {
            "id": "b",
            "text": "公車已經確定提早五分鐘離開。",
            "explanation": "原句說還有五分鐘會來，不是已經離開。"
          },
          {
            "id": "c",
            "text": "說話者必須在五分鐘內買一班公車。",
            "explanation": "沒有義務或購買的意思。"
          },
          {
            "id": "d",
            "text": "只是希望有公車，完全沒有任何依據。",
            "explanation": "原句明確以時刻表為依據。"
          }
        ],
        "answerId": "a",
        "explanation": "有時刻表、約定或已知事實等依據時，可用「はずだ」表達照理成立的推斷。"
      }
    ]
  },
  {
    "id": "grammar-wakedewanai",
    "pattern": "～わけではない",
    "category": "原因與判斷",
    "meaning": "並不是……；並非全都……",
    "connection": [
      "動詞普通形／い形容詞＋わけではない",
      "な形容詞＋なわけではない",
      "名詞＋であるわけではない（也常用「名詞＋なわけではない」）"
    ],
    "explanation": "否定某種推論、誤解或概括，不一定是否定所有情況。搭配「いつも」「全部」「全く」時，要留意部分否定與雙重否定。",
    "caution": "「わけではない」不等於「わけがない」的不可能。「分からないわけではない」表示不是完全不懂，不能簡化成完全不懂。",
    "examples": [
      {
        "japanese": "[日本語|にほんご]が[全|まった]く[分|わ]からないわけではありません。",
        "translation": "我並不是完全不懂日文。"
      },
      {
        "japanese": "[甘|あま]い[物|もの]が[嫌|きら]いなわけではありませんが、[今日|きょう]は[食|た]べたくありません。",
        "translation": "我並不是討厭甜食，只是今天不想吃。"
      }
    ],
    "questions": [
      {
        "id": "grammar-wakedewanai-q1",
        "kind": "meaning",
        "instruction": "這句話能支持哪個結論？",
        "japanese": "いつも[家|いえ]で[料理|りょうり]しますが、[外食|がいしょく]が[嫌|きら]いなわけではありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者非常討厭外食，完全不可能去餐廳。",
            "explanation": "句子正是否定「討厭外食」這個推論。"
          },
          {
            "id": "b",
            "text": "經常在家做飯，但並不是討厭外食。",
            "explanation": "「嫌いなわけではない」否定對外食的負面推論。"
          },
          {
            "id": "c",
            "text": "說話者不會做飯，所以每天都外食。",
            "explanation": "原句說經常在家做飯。"
          },
          {
            "id": "d",
            "text": "只要在家做飯，就一定再也不能外食。",
            "explanation": "沒有表示這種必然或禁止。"
          }
        ],
        "answerId": "b",
        "explanation": "常在家做飯，不代表討厭外食。「わけではない」可用來修正這種過度推論。"
      },
      {
        "id": "grammar-wakedewanai-q2",
        "kind": "connection",
        "instruction": "「嫌い」是な形容詞。用「わけではない」表達「並非討厭」，選出正確接續。",
        "japanese": "[私|わたし]はスポーツが[嫌|きら]い（　）、[今|いま]は[休|やす]みたいです。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "のわけではありませんが",
            "explanation": "な形容詞「嫌い」在這裡用「な」修飾「わけ」。"
          },
          {
            "id": "b",
            "text": "わけではありませんが",
            "explanation": "な形容詞此處不能省略「な」。"
          },
          {
            "id": "c",
            "text": "なわけではありませんが",
            "explanation": "な形容詞＋なわけではない，符合此處接續。"
          },
          {
            "id": "d",
            "text": "にわけではありませんが",
            "explanation": "「に」不能用作此處的修飾接續。"
          }
        ],
        "answerId": "c",
        "explanation": "「嫌いなわけではありません」是並非討厭；後面補充只是現在想休息。",
        "translation": "我並不是討厭運動，只是現在想休息。"
      },
      {
        "id": "grammar-wakedewanai-q3",
        "kind": "usage",
        "instruction": "哪個解讀正確處理了「每週」與否定的範圍？",
        "japanese": "[日曜日|にちようび]に[働|はたら]くこともあります。[毎週|まいしゅう][休|やす]めるわけではありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "每個星期日都絕對不能休息。",
            "explanation": "這是全面否定；原句只否定「每週都能休」。"
          },
          {
            "id": "b",
            "text": "每週都能休息，沒有任何例外。",
            "explanation": "原句說有時星期日也得工作。"
          },
          {
            "id": "c",
            "text": "只要工作一次，以後所有星期日都不能休。",
            "explanation": "沒有推導出未來永遠不能休的意思。"
          },
          {
            "id": "d",
            "text": "不是每週都能休息，有些星期日需要工作。",
            "explanation": "符合「毎週～わけではない」的部分否定。"
          }
        ],
        "answerId": "d",
        "explanation": "「毎週休めるわけではない」不是「每週都不能休」，而是「並非每週都能休」。"
      }
    ]
  },
  {
    "id": "grammar-wakeganai",
    "pattern": "～わけがない",
    "category": "原因與判斷",
    "meaning": "不可能……；怎麼可能……",
    "connection": [
      "動詞普通形／い形容詞＋わけがない",
      "な形容詞＋なわけがない",
      "名詞＋であるわけがない（也常用「名詞＋なわけがない」）"
    ],
    "explanation": "根據常識、事實或說話者的判斷，強烈否定某事成立的可能性。語氣比一般的「ない」更強。",
    "caution": "這是說話者強烈的判斷，未必是經客觀證明的不可能。和「わけではない」的部分否定不同；「わけにはいかない」則多指立場或情況不允許做某事。",
    "examples": [
      {
        "japanese": "[五分|ごふん]で[千|せん]ページの[本|ほん]を[全部|ぜんぶ][読|よ]めるわけがありません。",
        "translation": "不可能在五分鐘內讀完一本一千頁的書。"
      },
      {
        "japanese": "[彼|かれ]は[今|いま][外国|がいこく]にいるので、ここにいるわけがありません。",
        "translation": "他現在人在國外，不可能在這裡。"
      }
    ],
    "questions": [
      {
        "id": "grammar-wakeganai-q1",
        "kind": "meaning",
        "instruction": "說話者對「他在這裡」持什麼態度？",
        "japanese": "[彼|かれ]は[今|いま][外国|がいこく]にいるので、ここにいるわけがありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "根據他人在國外，強烈判斷他不可能在這裡。",
            "explanation": "「わけがない」強烈否定成立的可能性。"
          },
          {
            "id": "b",
            "text": "只是說他不是每次都在這裡。",
            "explanation": "這種部分否定較接近「いつもいるわけではない」。"
          },
          {
            "id": "c",
            "text": "希望他以後可以搬到這裡。",
            "explanation": "沒有表達願望。"
          },
          {
            "id": "d",
            "text": "確認他已經在這裡，但不讓他離開。",
            "explanation": "與原句強烈否定他在場相反。"
          }
        ],
        "answerId": "a",
        "explanation": "「いるわけがありません」表示說話者認為不可能在場，而非只是「不一定在」。"
      },
      {
        "id": "grammar-wakeganai-q2",
        "kind": "connection",
        "instruction": "用「わけがない」強烈否定知道這件事的可能性，選出標準接續。",
        "japanese": "その[話|はなし]を[誰|だれ]にもしていないので、[彼|かれ]が（　）。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[知|し]っていますわけがありません",
            "explanation": "「わけ」前用普通形，不能直接接「知っています」。"
          },
          {
            "id": "b",
            "text": "[知|し]っていてわけがありません",
            "explanation": "て形「知っていて」不能直接修飾「わけ」。"
          },
          {
            "id": "c",
            "text": "[知|し]っているのわけがありません",
            "explanation": "動詞普通形後直接接「わけ」，不用「の」。"
          },
          {
            "id": "d",
            "text": "[知|し]っているわけがありません",
            "explanation": "動詞普通形＋わけがない，接續正確。"
          }
        ],
        "answerId": "d",
        "explanation": "動詞「知っている」以普通形直接接「わけがありません」。",
        "translation": "我沒有把這件事告訴任何人，所以他不可能知道。"
      },
      {
        "id": "grammar-wakeganai-q3",
        "kind": "usage",
        "instruction": "下列哪個解讀符合句中的強烈否定？",
        "japanese": "[一人|ひとり]では[持|も]てないほど[重|おも]いので、[子|こ]ども[一人|ひとり]で[運|はこ]べるわけがありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "不是所有小孩都一定想搬，僅討論意願。",
            "explanation": "「運べるわけがない」否定搬得動的可能，不是討論願望。"
          },
          {
            "id": "b",
            "text": "東西太重，說話者認為不可能由一個小孩獨自搬動。",
            "explanation": "重量是判斷依據，「わけがない」強烈否定可能性。"
          },
          {
            "id": "c",
            "text": "雖然很重，但確定任何小孩都能獨自搬動。",
            "explanation": "這與強烈否定相反。"
          },
          {
            "id": "d",
            "text": "因為很重，所以規定小孩每次都必須搬。",
            "explanation": "沒有要求或義務的意思。"
          }
        ],
        "answerId": "b",
        "explanation": "「可能形＋わけがない」強調認為做不到；此處不是規定不能搬，也不是不想搬。"
      }
    ]
  }
];
