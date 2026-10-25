/** Avoid using these close meanings or overlapping usages as each other's
 * distractors in short meaning/context questions. Groups are symmetric and
 * intentionally conservative: they do not claim the words are interchangeable
 * in every sentence, nor prove that all remaining questions have one answer.
 * Notes and examples still teach distinctions such as scope and transitivity.
 */
export const quizExclusionGroups: readonly (readonly string[])[] = [
  ['shitaku', 'junbi'], // 支度／準備: getting ready
  ['mokuhyou', 'mokuteki'], // 目標／目的: aim or objective
  ['keikaku', 'yotei'], // 計画／予定: a planned arrangement
  ['houhou', 'tejun'], // 方法／手順: way of doing something
  ['houhou', 'kufuu'], // 方法／工夫: a devised way or means
  ['kufuu', 'kaizen'], // 工夫／改善: devising improvements
  ['shiji', 'shidou'], // 指示／指導: instructions or guidance
  ['happyou', 'houkoku'], // 発表／報告: presenting results
  ['houkoku', 'houdou'], // 報告／報道: reporting information
  ['kiji', 'houdou'], // 記事／報道: a report or news coverage
  ['houdou', 'housou'], // 報道／放送: news reported or broadcast
  ['kakunin', 'tashikameru'], // 確認／確かめる: confirming or checking
  ['tashikameru', 'shiraberu'], // 確かめる／調べる: checking to establish a fact
  ['shiraberu', 'chousa'], // 調べる／調査: investigating
  ['naosu', 'shuuri'], // 直す／修理: repairing an object
  ['naosu', 'aratameru', 'kaizen'], // 直す／改める／改善: correcting or improving
  ['tasukeru', 'kyuujo'], // 助ける／救助: rescue
  ['tasukeru', 'sasaeru'], // 助ける／支える: giving practical or emotional support
  ['machigau', 'machigaeru'], // 間違う／間違える: overlapping transitive uses
  ['fukumu', 'fukumeru'], // 含む／含める: include, with different perspectives
  ['chiiki', 'chihou'], // 地域／地方: a geographic region
  ['yurusu', 'mitomeru'], // 許す／認める: allowing or authorizing
  ['anki', 'kioku'], // 暗記／記憶: committing something to memory
  ['kitai', 'kibou'], // 期待／希望: hoping for a future outcome
  ['arigatai', 'kansha'], // ありがたい／感謝: feeling grateful
  ['kurushii', 'tsurai'], // 苦しい／つらい: painful or distressing
  ['tsukiai', 'tsukiau', 'kouryuu'], // 付き合い／付き合う／交流: social interaction
  ['kisoku', 'houritsu'], // 規則／法律: rules or laws that must be followed
  ['koshou', 'kowareru'], // 故障／壊れる: a machine breaking down
  ['fusegu', 'yobou'], // 防ぐ／予防: prevention
  ['fusegu', 'sakeru'], // 防ぐ／避ける: preventing or avoiding an accident
  ['haitatsu', 'todokeru'], // 配達／届ける: delivering something
  ['tsutaeru', 'renraku'], // 伝える／連絡: informing someone
  ['manin', 'konzatsu'], // 満員／混雑: a crowded vehicle or venue
  ['konzatsu', 'juutai'], // 混雑／渋滞: congested roads
  ['nedan', 'teika'], // 値段／定価: an item's price
  ['nedan', 'bukka'], // 値段／物価: prices, with different scopes
  ['tsurisen', 'kozeni'], // 釣り銭／小銭: change or coins
  ['oitsuku', 'maniau'], // 追いつく／間に合う: catching up or catching something in time
  ['sumaseru', 'katadzukeru'], // 済ませる／片付ける: finishing a task
  ['katadzukeru', 'matomeru'], // 片付ける／まとめる: gathering and organizing things
  ['matomeru', 'shuuchuu'], // まとめる／集中: bringing things together
  ['hikiukeru', 'tantou'], // 引き受ける／担当: taking responsibility for a task
];
