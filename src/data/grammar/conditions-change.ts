import type { GrammarPoint } from './types';

/** Original N4-to-N3 bridge lessons and questions; see docs/reviews/grammar-conditions-change.md. */
export const conditionsChangeGrammar: GrammarPoint[] = [
  {
    "id": "grammar-tatoetemo",
    "pattern": "たとえ～ても",
    "category": "條件與建議",
    "meaning": "即使……也……",
    "connection": [
      "たとえ＋動詞て形＋も",
      "たとえ＋い形容詞的くて形＋も",
      "たとえ＋名詞／な形容詞語幹＋でも"
    ],
    "explanation": "先假設一個可能不利的條件，再表達即使如此，後面的判斷、意志或結果也不改變。「たとえ」加強假設與讓步的語氣。",
    "caution": "不代表前面的情況已經發生，也不保證它一定會發生；重點是後面的立場不因該條件改變。",
    "examples": [
      {
        "japanese": "たとえ[雨|あめ]が[降|ふ]っても、[明日|あした]の[試合|しあい]を[見|み]に[行|い]きます。",
        "translation": "即使下雨，我明天也會去看比賽。"
      },
      {
        "japanese": "たとえ[一度|いちど][失敗|しっぱい]しても、もう[一度|いちど][挑戦|ちょうせん]したいです。",
        "translation": "即使失敗一次，我也想再挑戰一次。"
      }
    ],
    "questions": [
      {
        "id": "grammar-tatoetemo-q1",
        "kind": "meaning",
        "instruction": "這句話表達什麼意思？",
        "japanese": "たとえ[忙|いそが]しくても、[毎日|まいにち][少|すこ]しは[日本語|にほんご]を[勉強|べんきょう]します。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "只要很忙，就不會學日文。",
            "explanation": "這把讓步關係改成停止學習的條件。"
          },
          {
            "id": "b",
            "text": "因為很忙，所以才學日文。",
            "explanation": "原句沒有把忙碌當作學日文的原因。"
          },
          {
            "id": "c",
            "text": "每天學日文之後，就一定會很忙。",
            "explanation": "原句沒有表達學習造成忙碌的結果。"
          },
          {
            "id": "d",
            "text": "即使很忙，每天也會學一點日文。",
            "explanation": "後面的學習意志不因忙碌而改變。"
          }
        ],
        "answerId": "d",
        "explanation": "「たとえ～ても」表示即使前面的條件成立，後面的意志仍然維持。"
      },
      {
        "id": "grammar-tatoetemo-q2",
        "kind": "connection",
        "instruction": "請用「降る」的「ても」形填空。",
        "japanese": "たとえ[雨|あめ]が（　）、[試合|しあい]は[行|おこな]われます。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[降|ふ]ったも",
            "explanation": "這是た形接も，不是本題需要的ても形。"
          },
          {
            "id": "b",
            "text": "[降|ふ]りても",
            "explanation": "「降る」的て形不是「降りて」。"
          },
          {
            "id": "c",
            "text": "[降|ふ]っても",
            "explanation": "「降る」的て形是「降って」，再加「も」。"
          },
          {
            "id": "d",
            "text": "[降|ふ]るても",
            "explanation": "五段動詞不能直接在辭書形後加「ても」。"
          }
        ],
        "answerId": "c",
        "explanation": "五段動詞「降る」變成「降って」，因此是「たとえ雨が降っても」。"
      },
      {
        "id": "grammar-tatoetemo-q3",
        "kind": "usage",
        "instruction": "下句最適合表達哪一種態度？",
        "japanese": "たとえ[反対|はんたい]されても、[自分|じぶん]で[決|き]めた[道|みち]を[進|すす]みたいです。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "沒有人反對，就表示這條路一定正確。",
            "explanation": "原句沒有以無人反對來保證選擇正確。"
          },
          {
            "id": "b",
            "text": "即使受到反對，仍想堅持自己選擇的方向。",
            "explanation": "先假設受到反對，再表達意志不變。"
          },
          {
            "id": "c",
            "text": "只要有人反對，就會立刻改變決定。",
            "explanation": "與原句不因反對而改變的態度相反。"
          },
          {
            "id": "d",
            "text": "已經反對別人，所以現在感到後悔。",
            "explanation": "「反対される」是受到反對，且本句不是表達後悔。"
          }
        ],
        "answerId": "b",
        "explanation": "「たとえ」把可能的阻力提出來；「ても」之後仍保留想前進的意志。"
      }
    ]
  },
  {
    "id": "grammar-saeba",
    "pattern": "～さえ～ば",
    "category": "條件與建議",
    "meaning": "只要……就……",
    "connection": [
      "名詞＋さえ＋動詞ば形",
      "動詞ます形去掉ます＋さえすれば"
    ],
    "explanation": "把一個條件特別提出來，表示說話者認為只需滿足這項最低條件，後面的事情就能成立。",
    "caution": "這是說話者認為足以使結果成立的最低條件，不等於邏輯上的必要條件，也不是對現實世界的無條件保證。「さえ」的位置與後面動詞的條件形都要正確。",
    "examples": [
      {
        "japanese": "[住所|じゅうしょ]さえ[分|わ]かれば、[荷物|にもつ]を[送|おく]れます。",
        "translation": "只要知道地址，就能寄送包裹。"
      },
      {
        "japanese": "[毎日|まいにち][少|すこ]し[練習|れんしゅう]しさえすれば、この[曲|きょく]は[弾|ひ]けるようになります。",
        "translation": "只要每天稍微練習，就能漸漸學會彈這首曲子。"
      }
    ],
    "questions": [
      {
        "id": "grammar-saeba-q1",
        "kind": "meaning",
        "instruction": "說話者認為最重要的條件是什麼？",
        "japanese": "パスポートさえあれば、[受付|うけつけ]で[本人|ほんにん][確認|かくにん]ができます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "因為已確認身分，所以才能取得護照。",
            "explanation": "這把條件與後面的結果倒過來了。"
          },
          {
            "id": "b",
            "text": "每次取得護照，櫃台都會關門。",
            "explanation": "原句沒有每次發生或櫃台關門的意思。"
          },
          {
            "id": "c",
            "text": "只要有護照，就能在櫃台辦理身分確認。",
            "explanation": "護照被提出作為這項確認所需的最低條件。"
          },
          {
            "id": "d",
            "text": "就算沒有護照，也一定能確認身分。",
            "explanation": "原句明確提出有護照這項條件。"
          }
        ],
        "answerId": "c",
        "explanation": "「名詞＋さえあれば」把該物品的存在提出為足以進行後面行為的條件。"
      },
      {
        "id": "grammar-saeba-q2",
        "kind": "connection",
        "instruction": "請填入「分かる」的ば形。",
        "japanese": "[住所|じゅうしょ]さえ（　）、[荷物|にもつ]を[送|おく]れます。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[分|わ]かりば",
            "explanation": "五段動詞的ば形要把語尾變成え段。"
          },
          {
            "id": "b",
            "text": "[分|わ]かれば",
            "explanation": "五段動詞「分かる」的ば形是「分かれば」。"
          },
          {
            "id": "c",
            "text": "[分|わ]かるば",
            "explanation": "不能把ば直接接在辭書形後面。"
          },
          {
            "id": "d",
            "text": "[分|わ]かりますば",
            "explanation": "ば形不能直接接在ます形後面。"
          }
        ],
        "answerId": "b",
        "explanation": "「分かる」的語尾る變成れ，再加ば，成為「分かれば」。"
      },
      {
        "id": "grammar-saeba-q3",
        "kind": "usage",
        "instruction": "下句把哪件事視為能使用機器的最低條件？",
        "japanese": "[使|つか]い[方|かた]さえ[覚|おぼ]えれば、この[機械|きかい]は[一人|ひとり]でも[使|つか]えます。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "記住使用方法。",
            "explanation": "「使い方さえ覚えれば」明確指出這個條件。"
          },
          {
            "id": "b",
            "text": "一定要有兩個人一起操作。",
            "explanation": "原句說滿足條件後，一個人也能使用。"
          },
          {
            "id": "c",
            "text": "先把這台機器送去修理。",
            "explanation": "原句沒有提到故障或修理。"
          },
          {
            "id": "d",
            "text": "即使忘了方法也完全沒關係。",
            "explanation": "原句提出記住方法便足夠，沒有說忘記方法也完全沒關係。"
          }
        ],
        "answerId": "a",
        "explanation": "「さえ」強調「使い方」，後面的「覚えれば」給出條件；整句不是要求多人操作。"
      }
    ]
  },
  {
    "id": "grammar-naikagiri",
    "pattern": "～ない限り",
    "category": "條件與建議",
    "meaning": "除非……，否則不……",
    "connection": [
      "動詞ない形＋限り"
    ],
    "explanation": "表示如果前面的條件不改變，後面的否定結果或限制就會持續。常可譯為「除非……，否則……」。",
    "caution": "必須先改變「ない」所表達的否定狀態，才可能解除後面的限制；例如「許可を得ない限り」表示必須先取得許可，但不保證有了許可就一定能成功。後面不必每次都出現「ない」，也可用不能、困難等限制表達。",
    "examples": [
      {
        "japanese": "[雨|あめ]がやまない[限|かぎ]り、[外|そと]では[遊|あそ]べません。",
        "translation": "除非雨停，否則不能在外面玩。"
      },
      {
        "japanese": "[本人|ほんにん]に[確認|かくにん]しない[限|かぎ]り、[本当|ほんとう]の[理由|りゆう]は[分|わ]かりません。",
        "translation": "除非向本人確認，否則無法知道真正的原因。"
      }
    ],
    "questions": [
      {
        "id": "grammar-naikagiri-q1",
        "kind": "meaning",
        "instruction": "這句話的意思是什麼？",
        "japanese": "[鍵|かぎ]が[見|み]つからない[限|かぎ]り、この[部屋|へや]には[入|はい]れません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "每次進房間，鑰匙都會不見。",
            "explanation": "原句沒有反覆發生的意思。"
          },
          {
            "id": "b",
            "text": "除非找到鑰匙，否則不能進這個房間。",
            "explanation": "沒找到鑰匙時，不能進房間的限制會持續。"
          },
          {
            "id": "c",
            "text": "即使找到鑰匙，也絕對不能進房間。",
            "explanation": "原句沒有說找到之後仍絕對不能進。"
          },
          {
            "id": "d",
            "text": "只要沒找到鑰匙，就一定能進房間。",
            "explanation": "這與原句的限制相反。"
          }
        ],
        "answerId": "b",
        "explanation": "「見つからない限り」設定「仍未找到」的條件，後面說明在此條件下無法進入。"
      },
      {
        "id": "grammar-naikagiri-q2",
        "kind": "connection",
        "instruction": "請用「調べる」的ない形，完成「ない限り」的接續。",
        "japanese": "[自分|じぶん]で（　）[限|かぎ]り、[詳|くわ]しいことは[分|わ]かりません。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[調|しら]べない",
            "explanation": "一段動詞去掉る，加ない，再接限り。"
          },
          {
            "id": "b",
            "text": "[調|しら]べなく",
            "explanation": "ない改成なく不能直接接本題的限り。"
          },
          {
            "id": "c",
            "text": "[調|しら]べません",
            "explanation": "禮貌否定形不能直接代替這裡的ない形。"
          },
          {
            "id": "d",
            "text": "[調|しら]べて",
            "explanation": "て形沒有表達本題所需的否定條件。"
          }
        ],
        "answerId": "a",
        "explanation": "本題使用「動詞ない形＋限り」：調べる→調べない→調べない限り。"
      },
      {
        "id": "grammar-naikagiri-q3",
        "kind": "usage",
        "instruction": "依照這個規定，哪一項理解正確？",
        "japanese": "[許可|きょか]を[得|え]ない[限|かぎ]り、この[資料|しりょう]は[外|そと]に[持|も]ち[出|だ]せません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "取得許可後，其他規定一定全部失效。",
            "explanation": "本句沒有保證其他條件或規定會消失。"
          },
          {
            "id": "b",
            "text": "沒有許可時，反而可以自由帶出資料。",
            "explanation": "這把原句的限制解讀成允許。"
          },
          {
            "id": "c",
            "text": "只要把資料帶出去，就會自動取得許可。",
            "explanation": "原句沒有這種因果順序。"
          },
          {
            "id": "d",
            "text": "取得許可是能帶出資料的必要條件。",
            "explanation": "沒有許可就不能帶出，是本句明確提出的限制。"
          }
        ],
        "answerId": "d",
        "explanation": "「ない限り」說明未取得許可時不被允許；不能進一步推論取得許可便毫無其他限制。"
      }
    ]
  },
  {
    "id": "grammar-toshitara",
    "pattern": "～としたら",
    "category": "條件與建議",
    "meaning": "假如……；假設……",
    "connection": [
      "動詞／い形容詞普通形＋としたら",
      "名詞／な形容詞普通形＋としたら（肯定現在形保留だ）"
    ],
    "explanation": "暫時把一個情況當成假設，進一步詢問、推測或考慮在那種情況下會怎麼樣。",
    "caution": "不表示前面的情況已經確定。名詞與な形容詞在肯定現在式通常要保留「だ」，例如「休みだとしたら」。",
    "examples": [
      {
        "japanese": "もし[一週間|いっしゅうかん][休|やす]みがあるとしたら、どこへ[行|い]きたいですか。",
        "translation": "假如有一週假期，你想去哪裡？"
      },
      {
        "japanese": "その[話|はなし]が[本当|ほんとう]だとしたら、すぐに[予定|よてい]を[変|か]える[必要|ひつよう]があります。",
        "translation": "假如那件事是真的，就需要立刻更改行程。"
      }
    ],
    "questions": [
      {
        "id": "grammar-toshitara-q1",
        "kind": "meaning",
        "instruction": "說話者在做什麼？",
        "japanese": "もし[海外|かいがい]で[働|はたら]くとしたら、どの[国|くに]を[選|えら]びますか。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "假設要到海外工作，詢問會選哪個國家。",
            "explanation": "「としたら」提出尚未確定的假設供思考。"
          },
          {
            "id": "b",
            "text": "宣布已經選好海外工作的國家。",
            "explanation": "原句是提問，沒有宣布決定。"
          },
          {
            "id": "c",
            "text": "說明過去每次海外工作的經驗。",
            "explanation": "原句沒有反覆經驗或過去事實的意思。"
          },
          {
            "id": "d",
            "text": "禁止對方到任何海外國家工作。",
            "explanation": "原句沒有禁止的語氣。"
          }
        ],
        "answerId": "a",
        "explanation": "「もし～としたら」先設想情境，再詢問在該情境下的選擇。"
      },
      {
        "id": "grammar-toshitara-q2",
        "kind": "connection",
        "instruction": "請用な形容詞「本当」的肯定普通形填空。",
        "japanese": "その[情報|じょうほう]が（　）としたら、[早|はや]く[連絡|れんらく]したほうがいいです。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[本当|ほんとう]な",
            "explanation": "な是修飾名詞時的形式，這裡不是直接修飾名詞。"
          },
          {
            "id": "b",
            "text": "[本当|ほんとう]に",
            "explanation": "に是副詞形式，不是本題要用的肯定普通形。"
          },
          {
            "id": "c",
            "text": "[本当|ほんとう]で",
            "explanation": "で是連接形式，不能直接完成本題的だとしたら。"
          },
          {
            "id": "d",
            "text": "[本当|ほんとう]だ",
            "explanation": "な形容詞的肯定普通形是語幹加だ。"
          }
        ],
        "answerId": "d",
        "explanation": "「本当だ」是肯定普通形，因此接成「本当だとしたら」。"
      },
      {
        "id": "grammar-toshitara-q3",
        "kind": "usage",
        "instruction": "對這段話，哪種回應最切合它的用法？",
        "japanese": "[新|あたら]しい[仕事|しごと]を[選|えら]べるとしたら、どんな[仕事|しごと]がしたいですか。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "只回答現在幾點，不談工作。",
            "explanation": "這與假設情況及問題內容都不相干。"
          },
          {
            "id": "b",
            "text": "認為對方正在命令自己立刻辭職。",
            "explanation": "原句只提出假設，沒有要求辭職。"
          },
          {
            "id": "c",
            "text": "把能重新選工作當作假設，回答自己想做的工作。",
            "explanation": "這正是對假設情況下偏好的提問。"
          },
          {
            "id": "d",
            "text": "把這句話當成已收到正式錄取通知。",
            "explanation": "原句沒有表示任何公司已錄取自己。"
          }
        ],
        "answerId": "c",
        "explanation": "「選べるとしたら」不宣告現實中已能自由選擇，而是邀請對方設想。"
      }
    ]
  },
  {
    "id": "grammar-kotowanai",
    "pattern": "～ことはない",
    "category": "條件與建議",
    "meaning": "沒有必要……；用不著……",
    "connection": [
      "動詞辭書形＋ことはない"
    ],
    "explanation": "用來減輕對方的擔心或負擔，勸告對方沒有必要做前面的動作。禮貌形式是「ことはありません」。",
    "caution": "這裡不是「從來沒做過」的經驗表達；經驗通常用「動詞た形＋ことがない」。也不要和「ないことはない」混淆。",
    "examples": [
      {
        "japanese": "まだ[時間|じかん]があるので、そんなに[急|いそ]ぐことはありません。",
        "translation": "時間還夠，所以不用那麼著急。"
      },
      {
        "japanese": "そのくらいの[失敗|しっぱい]を、いつまでも[気|き]にすることはないですよ。",
        "translation": "那種程度的小失誤，不用一直放在心上。"
      }
    ],
    "questions": [
      {
        "id": "grammar-kotowanai-q1",
        "kind": "meaning",
        "instruction": "這句話是在如何勸對方？",
        "japanese": "まだ[締|し]め[切|き]りまで[一週間|いっしゅうかん]あるので、[心配|しんぱい]することはありません。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者這輩子從來沒有擔心過。",
            "explanation": "從未有過經驗需要其他形式，且不符合此處語境。"
          },
          {
            "id": "b",
            "text": "必須一直擔心，才會準時完成。",
            "explanation": "這與減輕擔心的意思相反。"
          },
          {
            "id": "c",
            "text": "事情已經確定失敗，擔心也沒有用。",
            "explanation": "原句並沒有表示失敗已經確定。"
          },
          {
            "id": "d",
            "text": "距離截止還有一週，沒有必要擔心。",
            "explanation": "辭書形「心配する」加ことはない是在安慰對方。"
          }
        ],
        "answerId": "d",
        "explanation": "本題的「ことはありません」表示不需要做「心配する」這個動作，不是在列舉人生經驗。"
      },
      {
        "id": "grammar-kotowanai-q2",
        "kind": "connection",
        "instruction": "要表達「不用著急」，應在「ことはない」前放入哪個形式？",
        "japanese": "まだ[時間|じかん]があるから、そんなに（　）ことはないよ。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[急|いそ]ぎ",
            "explanation": "動詞ます形語幹不能直接用於此處。"
          },
          {
            "id": "b",
            "text": "[急|いそ]げば",
            "explanation": "ば形已是條件形式，不是此處所需的辭書形。"
          },
          {
            "id": "c",
            "text": "[急|いそ]ぐ",
            "explanation": "本句型接動詞辭書形。"
          },
          {
            "id": "d",
            "text": "[急|いそ]いで",
            "explanation": "て形不能直接接成本題的「ことはない」。"
          }
        ],
        "answerId": "c",
        "explanation": "「急ぐ」是辭書形，「急ぐことはない」表示沒有必要著急。"
      },
      {
        "id": "grammar-kotowanai-q3",
        "kind": "usage",
        "instruction": "朋友因一次小失誤很沮喪，下句適合傳達什麼？",
        "japanese": "[一度|いちど]の[失敗|しっぱい]で、あきらめることはないよ。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "保證朋友以後絕對不會失敗。",
            "explanation": "原句鼓勵繼續努力，沒有保證未來結果。"
          },
          {
            "id": "b",
            "text": "安慰朋友，不必因為一次失敗就放棄。",
            "explanation": "「あきらめることはない」是在勸對方沒有必要放棄。"
          },
          {
            "id": "c",
            "text": "詢問朋友以前是否有放棄過。",
            "explanation": "原句不是詢問經驗，也不是疑問句。"
          },
          {
            "id": "d",
            "text": "命令朋友只要失敗一次就必須放棄。",
            "explanation": "這完全反轉了原句的勸告。"
          }
        ],
        "answerId": "b",
        "explanation": "動詞辭書形＋ことはない可用來安慰、勸告；這句著重不用因一次失敗而放棄。"
      }
    ]
  },
  {
    "id": "grammar-younisuru",
    "pattern": "～ようにする",
    "category": "目的與變化",
    "meaning": "盡量做到……；養成……的做法",
    "connection": [
      "動詞辭書形＋ようにする",
      "動詞ない形＋ようにする"
    ],
    "explanation": "表示有意識地努力做到某件事，或注意避免某個行為。「ようにしている」常用來說明持續注意或養成的習慣。",
    "caution": "不等於已經成功或能力已經改變。表達結果上的變化通常用「ようになる」；本句型強調努力與做法。",
    "examples": [
      {
        "japanese": "[健康|けんこう]のために、[毎朝|まいあさ][少|すこ]し[歩|ある]くようにしています。",
        "translation": "為了健康，我盡量每天早上走一點路。"
      },
      {
        "japanese": "[寝|ね]る[前|まえ]は、スマホを[見|み]ないようにしています。",
        "translation": "睡覺前，我會注意不看手機。"
      }
    ],
    "questions": [
      {
        "id": "grammar-younisuru-q1",
        "kind": "meaning",
        "instruction": "下句強調什麼？",
        "japanese": "[忘|わす]れないように、[大切|たいせつ]なことはすぐメモするようにしています。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "別人已經替說話者決定不用寫筆記。",
            "explanation": "本句不是外部決定，也不是不寫筆記。"
          },
          {
            "id": "b",
            "text": "每次一寫筆記，就一定會忘記。",
            "explanation": "原句的目的及做法都與此相反。"
          },
          {
            "id": "c",
            "text": "為了避免忘記，平常會注意立刻記下重要事項。",
            "explanation": "「メモするようにしている」說明持續採取的做法。"
          },
          {
            "id": "d",
            "text": "已經完全不會忘記任何事情。",
            "explanation": "有意識地努力不等於保證從此不會忘記。"
          }
        ],
        "answerId": "c",
        "explanation": "「ようにしている」強調平常持續注意的行為，不宣稱結果已百分之百達成。"
      },
      {
        "id": "grammar-younisuru-q2",
        "kind": "connection",
        "instruction": "請用「確認する」的辭書形，完成平常持續注意的做法。",
        "japanese": "[毎晩|まいばん]、[次|つぎ]の[日|ひ]の[予定|よてい]を（　）ようにしています。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[確認|かくにん]します",
            "explanation": "ようにする前用普通形，不用ます形。"
          },
          {
            "id": "b",
            "text": "[確認|かくにん]する",
            "explanation": "「ようにする」前可以接動詞辭書形。"
          },
          {
            "id": "c",
            "text": "[確認|かくにん]して",
            "explanation": "本句型不是以て形直接接ようにする。"
          },
          {
            "id": "d",
            "text": "[確認|かくにん]したら",
            "explanation": "たら已是條件形式，不能直接填入這個接續。"
          }
        ],
        "answerId": "b",
        "explanation": "持續注意去做某事可用「動詞辭書形＋ようにしています」。"
      },
      {
        "id": "grammar-younisuru-q3",
        "kind": "usage",
        "instruction": "下句適合用來說明哪種情況？",
        "japanese": "[授業|じゅぎょう]では、[分|わ]からないことをそのままにしないようにしています。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "上課遇到不懂的地方時，會有意識地去處理、不放著不管。",
            "explanation": "ないようにしている表示持續注意避免某個行為。"
          },
          {
            "id": "b",
            "text": "不需要任何努力，就自然變得全部聽懂。",
            "explanation": "本句強調自己的做法，而不是自然產生的能力變化。"
          },
          {
            "id": "c",
            "text": "老師規定從今天起永遠不能提問。",
            "explanation": "原句沒有提到這種規定，也不是禁止提問。"
          },
          {
            "id": "d",
            "text": "決定今後上課都不處理疑問。",
            "explanation": "這與不把問題放著不管的意思相反。"
          }
        ],
        "answerId": "a",
        "explanation": "「そのままにしないようにしている」是平常努力避免擱置問題，不是保證再也不會有疑問。"
      }
    ]
  },
  {
    "id": "grammar-youninaru",
    "pattern": "～ようになる",
    "category": "目的與變化",
    "meaning": "變得會……；逐漸開始……",
    "connection": [
      "動詞辭書形／可能形＋ようになる",
      "動詞ない形＋ようになる"
    ],
    "explanation": "表示能力、行為習慣或狀態從原本的情況改變，變得能做到某事，或開始以不同的方式行動。",
    "caution": "「ようになる」著重已出現或預期的變化；「ようにする」著重刻意努力。い形容詞的一般狀態變化用「くなる」，不要一律套用本句型。",
    "examples": [
      {
        "japanese": "[練習|れんしゅう]を[続|つづ]けて、[簡単|かんたん]な[日本語|にほんご]の[本|ほん]が[読|よ]めるようになりました。",
        "translation": "持續練習後，我變得能讀簡單的日文書了。"
      },
      {
        "japanese": "[引|ひ]っ[越|こ]してから、[毎日|まいにち][自分|じぶん]で[料理|りょうり]するようになりました。",
        "translation": "搬家後，我開始每天自己做飯了。"
      }
    ],
    "questions": [
      {
        "id": "grammar-youninaru-q1",
        "kind": "meaning",
        "instruction": "這句話表示哪一種變化？",
        "japanese": "[前|まえ]は[泳|およ]げませんでしたが、[今|いま]は[少|すこ]し[泳|およ]げるようになりました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "因為不會游泳，所以被禁止靠近水。",
            "explanation": "原句沒有禁止的內容。"
          },
          {
            "id": "b",
            "text": "以前不會游泳，現在變得能游一點了。",
            "explanation": "可能形「泳げる」加ようになる表示能力發生變化。"
          },
          {
            "id": "c",
            "text": "只是決定未來找一天開始學游泳。",
            "explanation": "原句表示現在已出現能力上的改變。"
          },
          {
            "id": "d",
            "text": "以前會游泳，現在完全不會了。",
            "explanation": "這把能力變化的方向顛倒了。"
          }
        ],
        "answerId": "b",
        "explanation": "「泳げるようになった」說明從不能到能的變化，不只是一個尚未實現的決定。"
      },
      {
        "id": "grammar-youninaru-q2",
        "kind": "connection",
        "instruction": "請用「話す」的可能形，表達現在能用日文交談。",
        "japanese": "[友人|ゆうじん]と[日本語|にほんご]で（　）ようになりました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[話|はな]せる",
            "explanation": "「話す」的可能形是「話せる」，可接ようになる。"
          },
          {
            "id": "b",
            "text": "[話|はな]して",
            "explanation": "て形不能直接用來完成本題的接續。"
          },
          {
            "id": "c",
            "text": "[話|はな]します",
            "explanation": "此處不能在ます形後直接接ようになる。"
          },
          {
            "id": "d",
            "text": "[話|はな]せ",
            "explanation": "這是命令形，不是表達能力的可能形。"
          }
        ],
        "answerId": "a",
        "explanation": "本題要表達能力變化，因此使用「話せるようになりました」。"
      },
      {
        "id": "grammar-youninaru-q3",
        "kind": "usage",
        "instruction": "原本不做飯的人，半年後已經常自己煮飯，下句著重哪一點？",
        "japanese": "[最近|さいきん]は、[週末|しゅうまつ]に[自分|じぶん]で[料理|りょうり]するようになりました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "只是提出要別人幫忙煮飯的要求。",
            "explanation": "原句的主體是自己，也沒有提出要求。"
          },
          {
            "id": "b",
            "text": "保證做的每一道料理都非常好吃。",
            "explanation": "原句描述習慣，不評價料理水準。"
          },
          {
            "id": "c",
            "text": "決定以後完全不做飯。",
            "explanation": "這與開始自己做飯的變化相反。"
          },
          {
            "id": "d",
            "text": "生活習慣已改變，最近開始在週末自己做飯。",
            "explanation": "辭書形加ようになる也可描述習慣改變，不只能力。"
          }
        ],
        "answerId": "d",
        "explanation": "「ようになる」不只表示會或不會，也能說明行為習慣已經改變。"
      }
    ]
  },
  {
    "id": "grammar-kotonisuru",
    "pattern": "～ことにする",
    "category": "目的與變化",
    "meaning": "決定要……；決定不……",
    "connection": [
      "動詞辭書形＋ことにする",
      "動詞ない形＋ことにする"
    ],
    "explanation": "說明由自己做出的決定或選擇。「ことにした」常用來報告已做好的決定，「ことにしている」也可表示自己訂下並持續遵守的做法。",
    "caution": "和「ことになる」相比，本句型把焦點放在自己的決定。決定做某事不等於事情已經完成。",
    "examples": [
      {
        "japanese": "[来月|らいげつ]から、[毎週|まいしゅう][図書館|としょかん]で[勉強|べんきょう]することにしました。",
        "translation": "我決定從下個月開始，每週到圖書館讀書。"
      },
      {
        "japanese": "[体|からだ]のために、[夜遅|よるおそ]くにコーヒーを[飲|の]まないことにしました。",
        "translation": "為了身體著想，我決定不在深夜喝咖啡。"
      }
    ],
    "questions": [
      {
        "id": "grammar-kotonisuru-q1",
        "kind": "meaning",
        "instruction": "這句話著重誰做出決定？",
        "japanese": "いろいろ[考|かんが]えて、[今年|ことし]は[日本語|にほんご]の[試験|しけん]を[受|う]けることにしました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者經過考慮，自己決定今年參加日文考試。",
            "explanation": "ことにする把焦點放在自己做出的選擇。"
          },
          {
            "id": "b",
            "text": "考試委員會決定取消今年的考試。",
            "explanation": "原句沒有委員會，也沒有取消考試。"
          },
          {
            "id": "c",
            "text": "說話者已經考完試並確定通過。",
            "explanation": "做出報考決定不等於已完成或已通過。"
          },
          {
            "id": "d",
            "text": "因為規定變更，所以所有人都必須報考。",
            "explanation": "原句沒有這種外部規定或全體義務。"
          }
        ],
        "answerId": "a",
        "explanation": "「考えて～ことにした」清楚表達考慮後自己的決定，不是在宣布考試結果。"
      },
      {
        "id": "grammar-kotonisuru-q2",
        "kind": "connection",
        "instruction": "請用「買う」的ない形，表達自己決定不購買。",
        "japanese": "[今月|こんげつ]は、[新|あたら]しい[服|ふく]を（　）ことにしました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[買|か]わなく",
            "explanation": "ない變成なく後，不能直接接本題的ことにする。"
          },
          {
            "id": "b",
            "text": "[買|か]いません",
            "explanation": "本句型前面用普通形，不直接接ます形。"
          },
          {
            "id": "c",
            "text": "[買|か]って",
            "explanation": "て形本身不能表達本題的否定決定。"
          },
          {
            "id": "d",
            "text": "[買|か]わない",
            "explanation": "買う的ない形是買わない，表示決定不買。"
          }
        ],
        "answerId": "d",
        "explanation": "「動詞ない形＋ことにする」表示決定不做，因此是「買わないことにしました」。"
      },
      {
        "id": "grammar-kotonisuru-q3",
        "kind": "usage",
        "instruction": "下句最適合用在哪種情況？",
        "japanese": "[通勤|つうきん][時間|じかん]を[短|みじか]くするために、[駅|えき]の[近|ちか]くへ[引|ひ]っ[越|こ]すことにしました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "已經搬家完成，不需要再表達任何決定。",
            "explanation": "本句重點是做出決定，無法只據此確定已搬完。"
          },
          {
            "id": "b",
            "text": "車站因事故而決定停止營運。",
            "explanation": "原句沒有車站停駛的意思。"
          },
          {
            "id": "c",
            "text": "自己衡量通勤時間後，決定搬到車站附近。",
            "explanation": "考量目的後自主選擇搬家，符合ことにする。"
          },
          {
            "id": "d",
            "text": "只是聽說車站附近也許有人要搬家。",
            "explanation": "本句是在說自己的決定，不是在轉述不確定傳聞。"
          }
        ],
        "answerId": "c",
        "explanation": "「～ことにしました」可在向人說明自己的新決定時使用，搬家是否完成需另外判斷。"
      }
    ]
  },
  {
    "id": "grammar-kotoninaru",
    "pattern": "～ことになる",
    "category": "目的與變化",
    "meaning": "決定將……；安排為……",
    "connection": [
      "動詞辭書形＋ことになる",
      "動詞ない形＋ことになる"
    ],
    "explanation": "說明經由安排、協議、規定或事情發展而形成的決定，焦點放在「事情已決定如此」，而非強調個人下決心。",
    "caution": "不一定表示自己完全沒有參與討論，也不必然代表被迫。「ことにする」通常較直接強調自己做出的決定。",
    "examples": [
      {
        "japanese": "[話|はな]し[合|あ]いの[結果|けっか]、[私|わたし]が[司会|しかい]をすることになりました。",
        "translation": "討論的結果，決定由我擔任主持人。"
      },
      {
        "japanese": "[工事|こうじ]のため、[来週|らいしゅう]はこの[教室|きょうしつ]を[使|つか]わないことになりました。",
        "translation": "因為施工，已決定下週不使用這間教室。"
      }
    ],
    "questions": [
      {
        "id": "grammar-kotoninaru-q1",
        "kind": "meaning",
        "instruction": "這句話最直接傳達什麼？",
        "japanese": "[会社|かいしゃ]の[人事|じんじ][異動|いどう]で、[来月|らいげつ]から[大阪|おおさか]で[働|はたら]くことになりました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "說話者已經自行辭職，決定不再工作。",
            "explanation": "原句沒有辭職，也不是停止工作。"
          },
          {
            "id": "b",
            "text": "說話者只是希望有一天能去大阪旅遊。",
            "explanation": "原句描述已形成的工作安排，不是旅行願望。"
          },
          {
            "id": "c",
            "text": "大阪的工作已完成，現在正回家。",
            "explanation": "原句的工作安排是從下個月開始。"
          },
          {
            "id": "d",
            "text": "因公司人事調動，已安排從下個月起在大阪工作。",
            "explanation": "ことになる把焦點放在人事安排所形成的結果。"
          }
        ],
        "answerId": "d",
        "explanation": "「人事異動で～ことになった」報告已形成的安排，不強調自己單方面下決心。"
      },
      {
        "id": "grammar-kotoninaru-q2",
        "kind": "connection",
        "instruction": "請用「働く」的辭書形，完成已決定的工作安排。",
        "japanese": "[来月|らいげつ]から、[別|べつ]の[部署|ぶしょ]で（　）ことになりました。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "[働|はたら]きます",
            "explanation": "本句型不能把ます形直接接在こと前面。"
          },
          {
            "id": "b",
            "text": "[働|はたら]けば",
            "explanation": "ば形已是條件形式，不是這裡需要的形式。"
          },
          {
            "id": "c",
            "text": "[働|はたら]く",
            "explanation": "ことになる前可以接動詞辭書形。"
          },
          {
            "id": "d",
            "text": "[働|はたら]いて",
            "explanation": "て形不能直接用於本題的接續。"
          }
        ],
        "answerId": "c",
        "explanation": "表示安排將做某事時，用「動詞辭書形＋ことになりました」。"
      },
      {
        "id": "grammar-kotoninaru-q3",
        "kind": "usage",
        "instruction": "讀到這個通知，哪種理解最合適？",
        "japanese": "[会場|かいじょう]の[都合|つごう]で、[説明会|せつめいかい]はオンラインで[行|おこな]うことになりました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "場地已經沒有問題，所以禁止使用網路。",
            "explanation": "這與原句改為線上舉辦的內容相反。"
          },
          {
            "id": "b",
            "text": "因場地因素，說明會已改為安排線上舉行。",
            "explanation": "外部情況形成的舉辦安排，符合ことになる。"
          },
          {
            "id": "c",
            "text": "說明會已在線上舉行完畢。",
            "explanation": "已確定安排不等於活動已經完成。"
          },
          {
            "id": "d",
            "text": "只要任何人反對，說明會一定永遠取消。",
            "explanation": "原句沒有反對或永久取消的條件。"
          }
        ],
        "answerId": "b",
        "explanation": "通知常用「ことになりました」傳達已經確定的安排；是否完成活動要看其他時間與語境。"
      }
    ]
  },
  {
    "id": "grammar-tameni",
    "pattern": "～ために",
    "category": "目的與變化",
    "meaning": "為了……",
    "connection": [
      "動詞辭書形＋ために",
      "名詞＋の＋ために"
    ],
    "explanation": "說明做某個行為的目的，常接有意志、可以主動追求的目標，再說明為了達成目標而做的行動。名詞後面要加「の」。",
    "caution": "「ために」也有表示原因的用法，本單元先練習目的。表達能力、狀態等非意志性目標時，常用「ように」，不宜把所有中文「為了」都直接換成「ために」。",
    "examples": [
      {
        "japanese": "[日本|にほん]へ[留学|りゅうがく]するために、[毎月|まいつき]お[金|かね]をためています。",
        "translation": "為了到日本留學，我每個月都在存錢。"
      },
      {
        "japanese": "[試験|しけん]のために、[苦手|にがて]な[文法|ぶんぽう]を[復習|ふくしゅう]しました。",
        "translation": "為了考試，我複習了不擅長的文法。"
      }
    ],
    "questions": [
      {
        "id": "grammar-tameni-q1",
        "kind": "meaning",
        "instruction": "這句話中，買字典的目的是什麼？",
        "japanese": "[日本語|にほんご]の[小説|しょうせつ]を[読|よ]むために、[新|あたら]しい[辞書|じしょ]を[買|か]いました。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "每次讀小說，都必須買一本新字典。",
            "explanation": "原句沒有表示每次反覆或這種義務。"
          },
          {
            "id": "b",
            "text": "買字典是為了從此完全不讀日文。",
            "explanation": "這與原句的目的相反。"
          },
          {
            "id": "c",
            "text": "為了閱讀日文小說。",
            "explanation": "ために前面的「小説を読む」就是購買字典的目的。"
          },
          {
            "id": "d",
            "text": "因為字典已經被賣完。",
            "explanation": "原句沒有字典售罄，也沒有用它作原因。"
          }
        ],
        "answerId": "c",
        "explanation": "目的用法的「～ために」把想達成的目標放在前面，把為此採取的行動放在後面。"
      },
      {
        "id": "grammar-tameni-q2",
        "kind": "connection",
        "instruction": "「留学」是名詞，接目的用法的「ために」時應填哪個助詞？",
        "japanese": "[留学|りゅうがく]（　）ために、お[金|かね]をためています。",
        "optionLanguage": "ja",
        "options": [
          {
            "id": "a",
            "text": "な",
            "explanation": "な形容詞的修飾形式不能套在名詞「留学」上。"
          },
          {
            "id": "b",
            "text": "の",
            "explanation": "名詞接ために時，用「名詞＋の＋ために」。"
          },
          {
            "id": "c",
            "text": "を",
            "explanation": "を可標示動作對象，但不能直接用來接名詞與ために。"
          },
          {
            "id": "d",
            "text": "が",
            "explanation": "が不能在此代替修飾ため的の。"
          }
        ],
        "answerId": "b",
        "explanation": "名詞「留学」後面使用「の」，所以是「留学のために」。"
      },
      {
        "id": "grammar-tameni-q3",
        "kind": "usage",
        "instruction": "依照下句，「每天練習」與「參加比賽」有什麼關係？",
        "japanese": "[来年|らいねん]の[大会|たいかい]に[出|で]るために、[毎日|まいにち][練習|れんしゅう]しています。",
        "optionLanguage": "zh-TW",
        "options": [
          {
            "id": "a",
            "text": "以參加明年的比賽為目的，每天練習。",
            "explanation": "前面是目的，後面是為了目的採取的行動。"
          },
          {
            "id": "b",
            "text": "已經參加完明年的比賽，才開始練習。",
            "explanation": "時間與前後關係不符合原句。"
          },
          {
            "id": "c",
            "text": "因為每天練習，所以規定不准參加比賽。",
            "explanation": "原句沒有禁止參賽的規定。"
          },
          {
            "id": "d",
            "text": "只是比較今年與明年哪一場比賽比較難。",
            "explanation": "原句沒有在做比較。"
          }
        ],
        "answerId": "a",
        "explanation": "「大会に出るために」說明行為的目的；每天練習是為了達成這個目標。"
      }
    ]
  }
];
