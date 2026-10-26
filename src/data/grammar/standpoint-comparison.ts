import type { GrammarPoint } from './types';

/** Original explanations, examples and questions for N4-to-N3 learners. */
export const standpointComparisonGrammar: GrammarPoint[] = [
  {
    "id": "grammar-nitotte",
    "pattern": "～にとって",
    "category": "立場與對象",
    "meaning": "對……而言；從……的立場來看",
    "connection": [
      "名詞＋にとって",
      "名詞＋にとっては（提出對比或特別強調）"
    ],
    "explanation": "以某個人或群體作為判斷的基準，後面常接重要、困難、方便等評價。",
    "caution": "「にとって」提出評價立場，不等於行為的對象或受益者；「先生に質問する」不能直接改成「先生にとって質問する」。",
    "examples": [
      {
        "japanese": "[私|わたし]にとって、[家族|かぞく]と[過|す]ごす[時間|じかん]は[大切|たいせつ]です。",
        "translation": "對我而言，和家人相處的時間很重要。"
      },
      {
        "japanese": "[日本語|にほんご]を[始|はじ]めたばかりの[人|ひと]にとって、この[本|ほん]は[少|すこ]し[難|むずか]しいでしょう。",
        "translation": "對剛開始學日文的人來說，這本書應該有點難。"
      }
    ],
    "questions": [
      {
        "id": "grammar-nitotte-q1",
        "kind": "meaning",
        "instruction": "這句話以誰的立場評價「便利」？",
        "japanese": "[車|くるま]を[持|も]たない[私|わたし]にとって、[駅|えき]に[近|ちか]い[家|いえ]は[便利|べんり]です。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "對所有人而言，車站旁的房子都方便。",
            "explanation": "句子只以說話者的情況評價，沒有代表所有人。"
          },
          {
            "id": "b",
            "text": "對沒有車的我而言，車站旁的房子很方便。",
            "explanation": "「私にとって」指出評價的立場。"
          },
          {
            "id": "c",
            "text": "我為了買車，搬到了車站旁。",
            "explanation": "句中沒有購車目的或搬家的描述。"
          },
          {
            "id": "d",
            "text": "對住在車站旁的人而言，汽車很方便。",
            "explanation": "句子評價的是房子方便，並非汽車。"
          }
        ],
        "answerId": "b",
        "explanation": "「私にとって」把「沒有車的我」設為判斷便利與否的基準。"
      },
      {
        "id": "grammar-nitotte-q2",
        "kind": "connection",
        "instruction": "要用「にとって」表達「對學生而言」，應填哪一項？",
        "japanese": "[学生|がくせい]（　）、[授業料|じゅぎょうりょう]の[安|やす]さは[大切|たいせつ]です。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をとって",
            "explanation": "不是表示評價立場的「にとって」。"
          },
          {
            "id": "b",
            "text": "ととって",
            "explanation": "名詞後不以「ととって」表達這個句型。"
          },
          {
            "id": "c",
            "text": "にとって",
            "explanation": "名詞「学生」直接接「にとって」。"
          },
          {
            "id": "d",
            "text": "でとって",
            "explanation": "「でとって」不能構成這裡的立場句型。"
          }
        ],
        "answerId": "c",
        "explanation": "名詞直接加「にとって」；此處從學生的立場評價學費便宜這件事。"
      },
      {
        "id": "grammar-nitotte-q3",
        "kind": "usage",
        "instruction": "依這句話，哪個說明最合適？",
        "japanese": "[私|わたし]にとって、[大勢|おおぜい]の[前|まえ]で[話|はな]すことは[大|おお]きな[挑戦|ちょうせん]です。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者認為，當眾說話對自己是很大的挑戰。",
            "explanation": "「私にとって」限定為說話者自身的評價。"
          },
          {
            "id": "b",
            "text": "說話者要求所有人都必須當眾說話。",
            "explanation": "句子沒有要求或命令。"
          },
          {
            "id": "c",
            "text": "說話者認為，所有人都不會當眾說話。",
            "explanation": "沒有描述所有人的能力。"
          },
          {
            "id": "d",
            "text": "說話者正在向觀眾介紹挑戰的規則。",
            "explanation": "「大勢の前で話す」是被評價的事情，不是介紹規則。"
          }
        ],
        "answerId": "a",
        "explanation": "「にとって」可表達個人的感受與評價，不把個人立場當成普遍事實。"
      }
    ]
  },
  {
    "id": "grammar-toshite",
    "pattern": "～として",
    "category": "立場與對象",
    "meaning": "作為……；以……身分",
    "connection": [
      "名詞＋として",
      "名詞＋としての＋名詞"
    ],
    "explanation": "說明某人以什麼身分行動，或某物以什麼用途被使用。",
    "caution": "表示角色或資格，與「にとって」的評價立場不同；修飾名詞時常用「としての」。",
    "examples": [
      {
        "japanese": "[私|わたし]は[通訳|つうやく]として、[会議|かいぎ]に[参加|さんか]しました。",
        "translation": "我以口譯人員的身分參加了會議。"
      },
      {
        "japanese": "この[部屋|へや]は、[客室|きゃくしつ]として[使|つか]っています。",
        "translation": "這個房間當作客房使用。"
      }
    ],
    "questions": [
      {
        "id": "grammar-toshite-q1",
        "kind": "meaning",
        "instruction": "這句話中的「として」表示什麼？",
        "japanese": "[兄|あに]は[医師|いし]として、[地域|ちいき]の[病院|びょういん]で[働|はたら]いています。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "哥哥為了成為醫師，正在醫院見習。",
            "explanation": "「医師として」已把醫師設為工作的身分，並非尚未取得的目標。"
          },
          {
            "id": "b",
            "text": "哥哥認為醫院很像醫師。",
            "explanation": "句子沒有相似的比較。"
          },
          {
            "id": "c",
            "text": "哥哥以醫師身分在當地醫院工作。",
            "explanation": "「名詞＋として」表達工作時的身分。"
          },
          {
            "id": "d",
            "text": "哥哥替某位醫師在醫院代班。",
            "explanation": "沒有「代わりに」等代替他人的表達。"
          }
        ],
        "answerId": "c",
        "explanation": "「医師として働く」是「以醫師的身分工作」。"
      },
      {
        "id": "grammar-toshite-q2",
        "kind": "connection",
        "instruction": "要表達「以代表的身分」，應如何接續「として」？",
        "japanese": "[代表|だいひょう]（　）、[会議|かいぎ]で[意見|いけん]を[述|の]べました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "のとして",
            "explanation": "名詞直接接「として」，這裡不加「の」。"
          },
          {
            "id": "b",
            "text": "にとして",
            "explanation": "這裡不在名詞與「として」之間加「に」。"
          },
          {
            "id": "c",
            "text": "をとして",
            "explanation": "「をとして」不是此身分句型。"
          },
          {
            "id": "d",
            "text": "として",
            "explanation": "「代表として」是以代表的身分。"
          }
        ],
        "answerId": "d",
        "explanation": "表達角色時使用「名詞＋として」。"
      },
      {
        "id": "grammar-toshite-q3",
        "kind": "usage",
        "instruction": "這句話說明了房間的哪一點？",
        "japanese": "この[部屋|へや]を、[仕事場|しごとば]として[使|つか]っています。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "房間是為了某個工作場所建造的。",
            "explanation": "句中沒有建造或建造目的。"
          },
          {
            "id": "b",
            "text": "房間被當作工作的場所使用。",
            "explanation": "「仕事場として」表示房間的用途。"
          },
          {
            "id": "c",
            "text": "房間比其他工作場所便宜。",
            "explanation": "句中沒有價格比較。"
          },
          {
            "id": "d",
            "text": "房間對所有工作者都很重要。",
            "explanation": "不是「にとって」的評價，也沒有所有工作者。"
          }
        ],
        "answerId": "b",
        "explanation": "「として」不只接人的身分，也可說明物品、場所的用途。"
      }
    ]
  },
  {
    "id": "grammar-niyotte",
    "pattern": "～によって",
    "category": "立場與對象",
    "meaning": "依……而異；透過……手段",
    "connection": [
      "名詞＋によって",
      "名詞＋による＋名詞（修飾名詞）"
    ],
    "explanation": "「によって」有多種用法。本單元練習「依條件或人而異」及「透過某種方法」；必須由整句判斷。",
    "caution": "不同用法不能一律翻成「因為」。例如「人によって違う」是因人而異，「調査によって分かる」是透過調查得知。",
    "examples": [
      {
        "japanese": "[人|ひと]によって、[好|す]きな[音楽|おんがく]は[違|ちが]います。",
        "translation": "人們喜歡的音樂因人而異。"
      },
      {
        "japanese": "アンケートによって、[利用者|りようしゃ]の[意見|いけん]を[集|あつ]めました。",
        "translation": "我們透過問卷蒐集了使用者的意見。"
      }
    ],
    "questions": [
      {
        "id": "grammar-niyotte-q1",
        "kind": "meaning",
        "instruction": "這句話中的「人によって」是什麼意思？",
        "japanese": "[人|ひと]によって、[休日|きゅうじつ]の[過|す]ごし[方|かた]は[違|ちが]います。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "每個人度過假日的方式可能不同。",
            "explanation": "「人によって違う」是因人而異。"
          },
          {
            "id": "b",
            "text": "大家的假日過法都必須相同。",
            "explanation": "「違います」明確表示有差異。"
          },
          {
            "id": "c",
            "text": "某個人替大家決定了假日行程。",
            "explanation": "沒有決定他人行程的意思。"
          },
          {
            "id": "d",
            "text": "所有人都透過調查度過假日。",
            "explanation": "這裡不是「調査によって」的方法用法。"
          }
        ],
        "answerId": "a",
        "explanation": "此處「によって」表示依人而異，不是被動句的行為者，也不是某種工具。"
      },
      {
        "id": "grammar-niyotte-q2",
        "kind": "connection",
        "instruction": "使用「によって」表達「透過問卷」，應填哪一項？",
        "japanese": "アンケート（　）、[利用者|りようしゃ]の[意見|いけん]を[集|あつ]めました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をよって",
            "explanation": "名詞後的手段句型不是「をよって」。"
          },
          {
            "id": "b",
            "text": "のよって",
            "explanation": "名詞後不使用「のよって」。"
          },
          {
            "id": "c",
            "text": "によって",
            "explanation": "「アンケートによって」表示透過問卷這個方法。"
          },
          {
            "id": "d",
            "text": "とよって",
            "explanation": "「とよって」不能構成這個句型。"
          }
        ],
        "answerId": "c",
        "explanation": "表示採用的手段時，可以使用「名詞＋によって」。此處不是每份問卷各不相同的意思。"
      },
      {
        "id": "grammar-niyotte-q3",
        "kind": "usage",
        "instruction": "請判斷這句話中的「によって」是哪一種用法。",
        "japanese": "[詳|くわ]しい[調査|ちょうさ]によって、[事故|じこ]の[原因|げんいん]が[分|わ]かりました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "依調查人員的喜好而有所不同。",
            "explanation": "句子沒有說結果因人而異。"
          },
          {
            "id": "b",
            "text": "因為發生調查，所以事故才發生。",
            "explanation": "「によって」在這裡連結得知原因的方法，不是事故的成因。"
          },
          {
            "id": "c",
            "text": "有人代替了調查工作。",
            "explanation": "沒有代替他人的意思。"
          },
          {
            "id": "d",
            "text": "透過詳細調查，得知了事故原因。",
            "explanation": "「調査」是查明事故原因的方法。"
          }
        ],
        "answerId": "d",
        "explanation": "同樣的「によって」在不同整句中可表示差異或手段，不能只背單一中文譯詞。"
      }
    ]
  },
  {
    "id": "grammar-nitaishite",
    "pattern": "～に対して",
    "category": "立場與對象",
    "meaning": "對……採取態度或行動；相對於……",
    "connection": [
      "名詞＋に対して",
      "動詞／い形容詞普通形＋のに対して（對比）",
      "な形容詞語幹／名詞＋なのに対して（現在肯定的對比）",
      "名詞／な形容詞的其他普通形＋のに対して（如「静かだったのに対して」）"
    ],
    "explanation": "可指出態度、感情或行為所朝向的對象，也可把前後兩種情況相對照。",
    "caution": "「について」多指出談論的主題；「に対して」常指出態度、要求等的對象。對比時，名詞、な形容詞的現在肯定用「なのに対して」；過去或否定則接普通形，例如「静かだったのに対して」。",
    "examples": [
      {
        "japanese": "[店員|てんいん]は、お[客|きゃく]さんに[対|たい]して[丁寧|ていねい]に[話|はな]します。",
        "translation": "店員對客人說話很有禮貌。"
      },
      {
        "japanese": "[兄|あに]は[静|しず]かなのに[対|たい]して、[弟|おとうと]はよく[話|はな]します。",
        "translation": "哥哥很安靜，相較之下，弟弟很愛說話。"
      }
    ],
    "questions": [
      {
        "id": "grammar-nitaishite-q1",
        "kind": "meaning",
        "instruction": "「学生に対して」在這句話中指出什麼？",
        "japanese": "[先生|せんせい]は[学生|がくせい]に[対|たい]して、いつも[丁寧|ていねい]に[説明|せつめい]します。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "老師把學生當成解說的話題。",
            "explanation": "這裡的學生是接受老師說明的對象，不是說明的主題。"
          },
          {
            "id": "b",
            "text": "學生是老師禮貌說明的對象。",
            "explanation": "「に対して」指出行為、態度所朝向的對象。"
          },
          {
            "id": "c",
            "text": "老師代替學生接受說明。",
            "explanation": "沒有代替的意思。"
          },
          {
            "id": "d",
            "text": "學生比老師更會說明。",
            "explanation": "句子沒有比較能力。"
          }
        ],
        "answerId": "b",
        "explanation": "此處描述老師對待學生的方式；「学生」是行動對象。"
      },
      {
        "id": "grammar-nitaishite-q2",
        "kind": "connection",
        "instruction": "要用「に対して」指出態度所朝向的對象，名詞後應接哪一項？",
        "japanese": "[相手|あいて]（　）、[失礼|しつれい]なことを[言|い]ってはいけません。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "に[対|たい]して",
            "explanation": "名詞「相手」直接接「に対して」。"
          },
          {
            "id": "b",
            "text": "のに[対|たい]して",
            "explanation": "對象用法不在名詞後加「のに」；對比名詞時是「なのに対して」。"
          },
          {
            "id": "c",
            "text": "を[対|たい]して",
            "explanation": "「を対して」不是這個句型。"
          },
          {
            "id": "d",
            "text": "と[対|たい]して",
            "explanation": "這裡的對象句型不是「と対して」。"
          }
        ],
        "answerId": "a",
        "explanation": "「相手に対して」指出話語所朝向的人。"
      },
      {
        "id": "grammar-nitaishite-q3",
        "kind": "usage",
        "instruction": "依這句話，哪一項正確？",
        "japanese": "[兄|あに]は[静|しず]かなのに[対|たい]して、[弟|おとうと]はよく[話|はな]します。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "弟弟代替哥哥說話。",
            "explanation": "句子用對比來描述兩人的個性，沒有代替。"
          },
          {
            "id": "b",
            "text": "哥哥因為弟弟說話而變安靜。",
            "explanation": "沒有表示兩者的因果關係。"
          },
          {
            "id": "c",
            "text": "哥哥安靜，而弟弟相對健談。",
            "explanation": "「なのに対して」把哥哥與弟弟的情況對照。"
          },
          {
            "id": "d",
            "text": "哥哥與弟弟說話的次數一定相同。",
            "explanation": "這與句子的對比相反。"
          }
        ],
        "answerId": "c",
        "explanation": "這是「に対して」的對比用法；「静か」是な形容詞，接「なのに対して」。"
      }
    ]
  },
  {
    "id": "grammar-nitsuite",
    "pattern": "～について",
    "category": "立場與對象",
    "meaning": "關於……；就……這個主題",
    "connection": [
      "名詞＋について",
      "名詞＋についての＋名詞"
    ],
    "explanation": "把名詞所指的事物設為談論、思考、調查或說明的主題。",
    "caution": "後接名詞時通常要加「の」，例如「環境についての本」。這裡的「について」不表示「跟在後面」。",
    "examples": [
      {
        "japanese": "[旅行|りょこう]の[計画|けいかく]について、[友人|ゆうじん]と[話|はな]しました。",
        "translation": "我和朋友談了旅行計畫。"
      },
      {
        "japanese": "[環境|かんきょう]についての[本|ほん]を、[図書館|としょかん]で[借|か]りました。",
        "translation": "我在圖書館借了一本關於環境的書。"
      }
    ],
    "questions": [
      {
        "id": "grammar-nitsuite-q1",
        "kind": "meaning",
        "instruction": "「新しい制度について」指出的是什麼？",
        "japanese": "[市役所|しやくしょ]で、[新|あたら]しい[制度|せいど]について[説明|せつめい]を[聞|き]きました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "某個新制度代替市公所提供說明。",
            "explanation": "沒有代替或制度自行說話的意思。"
          },
          {
            "id": "b",
            "text": "說話者在新制度的後面走。",
            "explanation": "這裡不是動詞「付く」的移動用法。"
          },
          {
            "id": "c",
            "text": "新制度是聽取說明的主題。",
            "explanation": "「について」指出說明的主題。"
          },
          {
            "id": "d",
            "text": "市公所已經取消了新制度。",
            "explanation": "句中沒有取消的描述。"
          }
        ],
        "answerId": "c",
        "explanation": "「名詞＋について」表示「關於這件事」，此處說明的內容是新制度。"
      },
      {
        "id": "grammar-nitsuite-q2",
        "kind": "connection",
        "instruction": "要用「について」表示談論主題，名詞後應填哪一項？",
        "japanese": "[旅行|りょこう]の[計画|けいかく]（　）、[友人|ゆうじん]と[話|はな]しました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をついて",
            "explanation": "「をついて」不能構成此處「關於」的句型。"
          },
          {
            "id": "b",
            "text": "について",
            "explanation": "「計画について」把計畫設為談論主題。"
          },
          {
            "id": "c",
            "text": "のついて",
            "explanation": "名詞直接加「について」，此處不加「の」。"
          },
          {
            "id": "d",
            "text": "でついて",
            "explanation": "「でついて」不是這個主題句型。"
          }
        ],
        "answerId": "b",
        "explanation": "使用「名詞＋について」；如果後面要修飾名詞，才用「についての」。"
      },
      {
        "id": "grammar-nitsuite-q3",
        "kind": "usage",
        "instruction": "這個說明會談的是什麼？",
        "japanese": "[説明会|せつめいかい]では、[留学|りゅうがく]の[費用|ひよう]について[詳|くわ]しく[話|はな]します。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "解說者自己的身分。",
            "explanation": "句子沒有用「として」介紹解說者身分。"
          },
          {
            "id": "b",
            "text": "費用比去年增加的幅度。",
            "explanation": "可能是延伸內容，但句子沒有提到年度比較，不能自行推斷。"
          },
          {
            "id": "c",
            "text": "說明會的座位安排。",
            "explanation": "句子的主題不是座位。"
          },
          {
            "id": "d",
            "text": "留學所需的費用。",
            "explanation": "「留学の費用について」明確提出說明主題。"
          }
        ],
        "answerId": "d",
        "explanation": "「について」指出內容範圍；不能從這句話自行推斷具體金額或漲幅。"
      }
    ]
  },
  {
    "id": "grammar-bahodo",
    "pattern": "～ば～ほど",
    "category": "比較與程度",
    "meaning": "越……越……",
    "connection": [
      "動詞ば形＋同一動詞辭書形＋ほど",
      "い形容詞：～ければ＋同一形容詞原形＋ほど",
      "な形容詞：語幹＋なら＋同一語幹＋なほど"
    ],
    "explanation": "描述前項程度增加時，後項的程度也跟著變化。「ば」前與「ほど」前通常重複同一個動詞或形容詞，並依各自需要活用。",
    "caution": "這個句型是程度的連動，不只是「如果……就……」的一次性條件；不代表所有場合都沒有例外。",
    "examples": [
      {
        "japanese": "[練習|れんしゅう]すればするほど、[発音|はつおん]が[自然|しぜん]になります。",
        "translation": "越練習，發音就越自然。"
      },
      {
        "japanese": "[駅|えき]に[近|ちか]ければ[近|ちか]いほど、[家賃|やちん]が[高|たか]くなります。",
        "translation": "越靠近車站，房租就越高。"
      }
    ],
    "questions": [
      {
        "id": "grammar-bahodo-q1",
        "kind": "meaning",
        "instruction": "這句話描述什麼關係？",
        "japanese": "[使|つか]えば[使|つか]うほど、この[道具|どうぐ]の[便利|べんり]さが[分|わ]かります。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "使用得越多，就越能了解這個用具的便利之處。",
            "explanation": "「使えば使うほど」表示使用程度與理解程度的連動。"
          },
          {
            "id": "b",
            "text": "只要使用一次，就能保證完全理解所有功能。",
            "explanation": "句型沒有一次即完全理解的保證。"
          },
          {
            "id": "c",
            "text": "用具越方便，使用次數就一定越少。",
            "explanation": "句子沒有這種反方向的關係。"
          },
          {
            "id": "d",
            "text": "即使從不使用，也已經了解用具的便利之處。",
            "explanation": "這與「越用越了解」不符。"
          }
        ],
        "answerId": "a",
        "explanation": "重複同一動詞的「ば～ほど」表示「越做前項，後項越明顯」。"
      },
      {
        "id": "grammar-bahodo-q2",
        "kind": "connection",
        "instruction": "使用「する」的「ば～ほど」句型，哪一項接續正確？",
        "japanese": "[練習|れんしゅう]（　）、[発音|はつおん]が[自然|しぜん]になります。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "すればしてほど",
            "explanation": "「ほど」前應接此句型中的辭書形「する」，不是「して」。"
          },
          {
            "id": "b",
            "text": "するばするほど",
            "explanation": "「する」的ば形是「すれば」，不是「するば」。"
          },
          {
            "id": "c",
            "text": "すればするほど",
            "explanation": "「すれば」加同一動詞的辭書形「する」與「ほど」。"
          },
          {
            "id": "d",
            "text": "すればしたほど",
            "explanation": "此句型重複動詞時，後半用辭書形「する」，不是過去形「した」。"
          }
        ],
        "answerId": "c",
        "explanation": "「する」的標準形式是「すればするほど」。"
      },
      {
        "id": "grammar-bahodo-q3",
        "kind": "usage",
        "instruction": "哪個說明符合這句話？",
        "japanese": "この[店|みせ]では、[商品|しょうひん]が[安|やす]ければ[安|やす]いほど、よく[売|う]れます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "所有商品的價格都完全相同。",
            "explanation": "句子比較不同的便宜程度。"
          },
          {
            "id": "b",
            "text": "在這間店，商品越便宜，賣得越好。",
            "explanation": "「安ければ安いほど」表示便宜程度與銷售情況連動。"
          },
          {
            "id": "c",
            "text": "只要便宜，商品就一定會全部賣完。",
            "explanation": "「よく売れる」不保證全部售罄。"
          },
          {
            "id": "d",
            "text": "店家決定以後不再降價。",
            "explanation": "句中沒有決定停止降價。"
          }
        ],
        "answerId": "b",
        "explanation": "い形容詞使用「安ければ安いほど」；句子談這家店的情況，不能擴大成所有商店的保證。"
      }
    ]
  },
  {
    "id": "grammar-hodonai",
    "pattern": "～ほど～ない",
    "category": "比較與程度",
    "meaning": "沒有……那麼……；不如……那樣……",
    "connection": [
      "A は B ほど＋否定述語"
    ],
    "explanation": "以 B 作為比較基準，說明 A 的某個程度沒有達到 B。否定的是比較程度，不一定是否定性質本身。",
    "caution": "「A は B ほど高くない」不表示 A 完全不貴，只表示相較之下沒有 B 那麼貴。",
    "examples": [
      {
        "japanese": "この[店|みせ]は、[駅前|えきまえ]の[店|みせ]ほど[高|たか]くありません。",
        "translation": "這間店沒有車站前那間店那麼貴。"
      },
      {
        "japanese": "[今日|きょう]は[昨日|きのう]ほど[寒|さむ]くないです。",
        "translation": "今天沒有昨天那麼冷。"
      }
    ],
    "questions": [
      {
        "id": "grammar-hodonai-q1",
        "kind": "meaning",
        "instruction": "這句話能確定的是哪一項？",
        "japanese": "このホテルは、あのホテルほど[高|たか]くありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "這間飯店完全免費。",
            "explanation": "比較沒那麼貴，不代表不用付費。"
          },
          {
            "id": "b",
            "text": "這間飯店比那間更貴。",
            "explanation": "與「あのホテルほど高くない」的比較方向相反。"
          },
          {
            "id": "c",
            "text": "兩間飯店都已經客滿。",
            "explanation": "句中沒有住宿人數或客滿的資訊。"
          },
          {
            "id": "d",
            "text": "這間飯店沒有那間飯店那麼貴。",
            "explanation": "「AはBほど高くない」比較 A 與 B 的價格程度。"
          }
        ],
        "answerId": "d",
        "explanation": "「ほど～ない」否定達到比較基準的程度，不等於否定所有費用。"
      },
      {
        "id": "grammar-hodonai-q2",
        "kind": "connection",
        "instruction": "使用「ほど～ない」作否定比較，空格應填哪一項？",
        "japanese": "[今日|きょう]は[昨日|きのう]（　）[寒|さむ]くありません。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "ほど",
            "explanation": "「昨日ほど寒くない」表示沒有昨天那麼冷。"
          },
          {
            "id": "b",
            "text": "をほど",
            "explanation": "比較基準後直接用「ほど」，不是「をほど」。"
          },
          {
            "id": "c",
            "text": "にほど",
            "explanation": "此比較句型不在「昨日」與「ほど」之間加「に」。"
          },
          {
            "id": "d",
            "text": "とほど",
            "explanation": "此比較句型不用「とほど」。"
          }
        ],
        "answerId": "a",
        "explanation": "比較基準「昨日」直接接「ほど」，述語使用否定形。"
      },
      {
        "id": "grammar-hodonai-q3",
        "kind": "usage",
        "instruction": "這句話是否表示白天的電車完全沒有人？",
        "japanese": "[昼|ひる]の[電車|でんしゃ]は、[朝|あさ]の[電車|でんしゃ]ほど[混|こ]んでいません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "是，因為「いません」表示一個人也沒有。",
            "explanation": "「いません」在這裡屬於「混んでいません」的否定，不是說乘客不存在。"
          },
          {
            "id": "b",
            "text": "是，這是電車停駛的意思。",
            "explanation": "句子沒有停駛的資訊。"
          },
          {
            "id": "c",
            "text": "否，只說白天的電車沒有早上的那麼擁擠。",
            "explanation": "「ほど～ない」比較擁擠程度，不保證完全空車。"
          },
          {
            "id": "d",
            "text": "否，這句話表示早上比白天更空。",
            "explanation": "比較方向相反；是白天較不擁擠。"
          }
        ],
        "answerId": "c",
        "explanation": "否定比較需要保留程度差，不應把「較不擁擠」誤讀成「完全沒有人」。"
      }
    ]
  },
  {
    "id": "grammar-dakedena",
    "pattern": "～だけでなく～も",
    "category": "比較與程度",
    "meaning": "不只……，也……",
    "connection": [
      "名詞＋だけでなく、～も",
      "動詞／い形容詞普通形＋だけでなく、～も",
      "な形容詞語幹＋なだけでなく、～も（現在肯定）",
      "名詞／な形容詞的過去或否定普通形＋だけでなく（如「親切だっただけでなく」）"
    ],
    "explanation": "在前項成立的基礎上，再添加另一個也成立的項目，常與「も」搭配。",
    "caution": "「だけでなく」是「不只有」，不是「沒有」。な形容詞的現在肯定常用「親切なだけでなく」；過去或否定則用「親切だっただけでなく」「親切ではないだけでなく」，不能一律加「な」。",
    "examples": [
      {
        "japanese": "[彼女|かのじょ]は[英語|えいご]だけでなく、[日本語|にほんご]も[話|はな]せます。",
        "translation": "她不只會說英文，也會說日文。"
      },
      {
        "japanese": "この[店|みせ]の[料理|りょうり]は、おいしいだけでなく、[値段|ねだん]も[安|やす]いです。",
        "translation": "這間店的料理不只好吃，價格也便宜。"
      }
    ],
    "questions": [
      {
        "id": "grammar-dakedena-q1",
        "kind": "meaning",
        "instruction": "這句話表示哪些語言能力？",
        "japanese": "[彼女|かのじょ]は[英語|えいご]だけでなく、[日本語|にほんご]も[話|はな]せます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "她只會英文，不會日文。",
            "explanation": "「日本語も」表示日文也是她會說的語言。"
          },
          {
            "id": "b",
            "text": "她英文和日文都會說。",
            "explanation": "「AだけでなくBも」表示 A 與 B 都成立。"
          },
          {
            "id": "c",
            "text": "她只會日文，不會英文。",
            "explanation": "「だけでなく」沒有否定她會英文。"
          },
          {
            "id": "d",
            "text": "她兩種語言都不會說。",
            "explanation": "句子用「話せます」肯定能力。"
          }
        ],
        "answerId": "b",
        "explanation": "這裡是在肯定英文能力後，再加上日文能力。"
      },
      {
        "id": "grammar-dakedena-q2",
        "kind": "connection",
        "instruction": "要表達「不只書，也能借 DVD」，應填哪一項？",
        "japanese": "この[図書館|としょかん]では、[本|ほん]（　）、[映画|えいが]のDVDも[借|か]りられます。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "だけなく",
            "explanation": "此句型的固定形式是「だけでなく」，不能省掉「で」。"
          },
          {
            "id": "b",
            "text": "だけをなく",
            "explanation": "名詞後不以「だけをなく」表達追加。"
          },
          {
            "id": "c",
            "text": "だけにしなく",
            "explanation": "這不是本題要求的「不只……也……」句型。"
          },
          {
            "id": "d",
            "text": "だけでなく",
            "explanation": "名詞「本」直接接「だけでなく」。"
          }
        ],
        "answerId": "d",
        "explanation": "「本だけでなく、DVDも」把書與 DVD 都列為可以借用的項目。"
      },
      {
        "id": "grammar-dakedena-q3",
        "kind": "usage",
        "instruction": "哪個說明符合這句話？",
        "japanese": "この[道具|どうぐ]は[軽|かる]いだけでなく、[丈夫|じょうぶ]でもあります。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "這個用具既輕便又耐用。",
            "explanation": "「軽い」與「丈夫」兩個優點都成立。"
          },
          {
            "id": "b",
            "text": "這個用具耐用，但是很重。",
            "explanation": "前項明確肯定「軽い」，不是很重。"
          },
          {
            "id": "c",
            "text": "這個用具輕便，所以一定容易壞。",
            "explanation": "後項是「丈夫」耐用，沒有容易壞的因果。"
          },
          {
            "id": "d",
            "text": "這個用具的輕便與耐用都尚未確認。",
            "explanation": "句子直接肯定這兩項性質。"
          }
        ],
        "answerId": "a",
        "explanation": "「だけでなく」後面也可用「～でもある」添加另一個性質；這裡的「で」是な形容詞「丈夫」的接續。"
      }
    ]
  },
  {
    "id": "grammar-kawarini",
    "pattern": "～かわりに",
    "category": "比較與程度",
    "meaning": "代替……；相對地……（交換或取捨）",
    "connection": [
      "名詞＋のかわりに（代替某人或某物）",
      "動詞／い形容詞普通形＋かわりに",
      "な形容詞語幹＋なかわりに"
    ],
    "explanation": "可表示用另一個人、物或行動取代前項，也可說明具有某個優點時，相對存在另一個代價或條件。",
    "caution": "要依語境區分「代替」與「取捨」。本單元以「名詞＋のかわりに」表示代替某人或某物；「父親代わり」等使用「～がわり」的複合詞是另一種構詞方式。",
    "examples": [
      {
        "japanese": "[今日|きょう]はコーヒーのかわりに、お[茶|ちゃ]を[飲|の]みます。",
        "translation": "今天我不喝咖啡，改喝茶。"
      },
      {
        "japanese": "この[部屋|へや]は[駅|えき]に[近|ちか]いかわりに、[家賃|やちん]が[高|たか]いです。",
        "translation": "這個房間雖然靠近車站，但相對地房租很高。"
      }
    ],
    "questions": [
      {
        "id": "grammar-kawarini-q1",
        "kind": "meaning",
        "instruction": "這句話表示這次要喝什麼？",
        "japanese": "コーヒーのかわりに、お[茶|ちゃ]を[飲|の]みます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "咖啡與茶各喝一杯。",
            "explanation": "句子用「かわりに」表示代替，不是兩者都喝。"
          },
          {
            "id": "b",
            "text": "只喝咖啡，不喝茶。",
            "explanation": "實際執行的是後項「お茶を飲む」。"
          },
          {
            "id": "c",
            "text": "不喝咖啡，改喝茶。",
            "explanation": "「コーヒーのかわりに」表示用茶取代咖啡。"
          },
          {
            "id": "d",
            "text": "不喝咖啡，也不喝茶。",
            "explanation": "後項明確說要喝茶。"
          }
        ],
        "answerId": "c",
        "explanation": "代替用法中，被取代的是「かわりに」前面的項目，實際選擇的是後項。"
      },
      {
        "id": "grammar-kawarini-q2",
        "kind": "connection",
        "instruction": "要表達「代替父親出席」，名詞「父」後應接哪一項？",
        "japanese": "[父|ちち]（　）、[私|わたし]が[会議|かいぎ]に[出|で]ました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "をかわりに",
            "explanation": "名詞作代替對象時不用「をかわりに」。"
          },
          {
            "id": "b",
            "text": "のかわりに",
            "explanation": "名詞作代替對象時，使用「名詞＋のかわりに」。"
          },
          {
            "id": "c",
            "text": "にかわりの",
            "explanation": "這裡需要連接後續行動，不是「かわりの」的名詞修飾形式。"
          },
          {
            "id": "d",
            "text": "のかわりを",
            "explanation": "這裡用「のかわりに」連接代替關係與出席的行動；「のかわりを」不能組成題目要求的句子。"
          }
        ],
        "answerId": "b",
        "explanation": "「父のかわりに」表示由我代替父親做後項的行動。"
      },
      {
        "id": "grammar-kawarini-q3",
        "kind": "usage",
        "instruction": "這句話中的「かわりに」說明什麼？",
        "japanese": "この[部屋|へや]は[駅|えき]に[近|ちか]いかわりに、[家賃|やちん]が[高|たか]いです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者改用房租代替車站。",
            "explanation": "「房租代替車站」不符合此句的取捨關係。"
          },
          {
            "id": "b",
            "text": "房間很遠，所以租金很低。",
            "explanation": "前後兩項都與原句相反。"
          },
          {
            "id": "c",
            "text": "只要租金高，房間就保證靠近車站。",
            "explanation": "句子只描述這個房間，沒有普遍保證。"
          },
          {
            "id": "d",
            "text": "房間靠近車站，但相對要付較高的房租。",
            "explanation": "此處對照便利的優點與費用較高的代價。"
          }
        ],
        "answerId": "d",
        "explanation": "這裡不是換掉某個人或物，而是描述優點與代價的取捨。"
      }
    ]
  },
  {
    "id": "grammar-toiuyori",
    "pattern": "～というより",
    "category": "比較與程度",
    "meaning": "與其說……，不如說……",
    "connection": [
      "名詞＋というより",
      "動詞／い形容詞普通形＋というより",
      "な形容詞語幹＋というより（也可用「だというより」）"
    ],
    "explanation": "先提出一種描述，再用後項修正它，表示後項更貼近說話者想表達的情況。",
    "caution": "不是單純比較喜好，也不一定把前項完全否定；重點在於「換個說法更準確」。",
    "examples": [
      {
        "japanese": "[彼|かれ]は[友達|ともだち]というより、[家族|かぞく]のような[存在|そんざい]です。",
        "translation": "與其說他是朋友，不如說是像家人一樣的存在。"
      },
      {
        "japanese": "この[問題|もんだい]は[難|むずか]しいというより、[説明|せつめい]が[足|た]りないと[思|おも]います。",
        "translation": "我覺得與其說這題很難，不如說是說明不足。"
      }
    ],
    "questions": [
      {
        "id": "grammar-toiuyori-q1",
        "kind": "meaning",
        "instruction": "說話者認為哪個描述更貼切？",
        "japanese": "[疲|つか]れたというより、[眠|ねむ]いです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "與其說疲累，更準確地說是想睡。",
            "explanation": "「というより」用後項修正前項的描述。"
          },
          {
            "id": "b",
            "text": "說話者比較喜歡疲累，不喜歡睡覺。",
            "explanation": "不是喜好的選擇。"
          },
          {
            "id": "c",
            "text": "說話者已經完全不想睡了。",
            "explanation": "後項肯定「眠い」，表示想睡。"
          },
          {
            "id": "d",
            "text": "只要累了，就一定能立刻入睡。",
            "explanation": "句子沒有條件或入睡保證。"
          }
        ],
        "answerId": "a",
        "explanation": "後項「眠い」是說話者認為更合適的描述；不必推論說話者完全不累。"
      },
      {
        "id": "grammar-toiuyori-q2",
        "kind": "connection",
        "instruction": "要表達「與其說生氣，不如說……」，應接哪一項？",
        "japanese": "[彼|かれ]は[怒|おこ]っている（　）、[困|こま]っているようです。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "とより",
            "explanation": "不能省去「いう」而形成此句型。"
          },
          {
            "id": "b",
            "text": "よりという",
            "explanation": "此句型的順序是「というより」，不是「よりという」。"
          },
          {
            "id": "c",
            "text": "というより",
            "explanation": "在普通形「怒っている」後接「というより」。"
          },
          {
            "id": "d",
            "text": "をいうより",
            "explanation": "此處使用引述的「と」，不是受詞助詞「を」。"
          }
        ],
        "answerId": "c",
        "explanation": "「怒っているというより」先提出「生氣」這個描述，再修正為「似乎感到為難」。"
      },
      {
        "id": "grammar-toiuyori-q3",
        "kind": "usage",
        "instruction": "這句話是在做什麼？",
        "japanese": "この[服|ふく]は[青|あお]いというより、[緑|みどり]に[近|ちか]いです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "在比較買藍衣服和綠衣服哪個便宜。",
            "explanation": "句中沒有購買或價格比較。"
          },
          {
            "id": "b",
            "text": "將「藍色」的描述修正為「更接近綠色」。",
            "explanation": "「というより」表示後項對這件衣服的顏色更貼切。"
          },
          {
            "id": "c",
            "text": "表示這件衣服一定完全沒有藍色成分。",
            "explanation": "修正顏色描述不等於斷言完全沒有任何藍色。"
          },
          {
            "id": "d",
            "text": "表示衣服已經從藍色染成綠色。",
            "explanation": "句中沒有染色或時間上的變化。"
          }
        ],
        "answerId": "b",
        "explanation": "「というより」用於修正描述；不能額外推論顏料成分或先前是否改過顏色。"
      }
    ]
  }
];
