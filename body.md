# StartNewGame
body:
{
    "script_id": "21",
    "user_id": null
}
response:
{
    "success": true,
    "message": "游戏创建成功",
    "error": null,
    "data": {
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "available_human_characters": [
            "朱大强",
            "朱丰翰",
            "朱丰震",
            "朱玲玲",
            "许苗苗"
        ]
    },
    "game_state": {
        "game_id": "game_ce20a9d1-f22a-468d-b9a4-e2a2eea8357c",
        "script_id": "21",
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "current_act": 1,
        "current_phase": "initialization",
        "max_acts": 3,
        "player_count": 0,
        "character_count": 5,
        "created_at": "2025-07-18T14:11:04.182066Z",
        "updated_at": "2025-07-18T14:11:04.182066Z",
        "started_at": "2025-07-18T14:11:04.182066Z",
        "completed_at": null
    }
}

# Join Game
body:
{
  "player_id": "神探李",
  "character_id": "许苗苗"
}
response:
{
    "success": true,
    "message": "玩家 神探李 成功加入游戏",
    "error": null,
    "data": {
        "player_id": "神探李",
        "character_id": "许苗苗",
        "turn_order": [
            "神探李"
        ]
    },
    "game_state": null
}
# Process Game Action 独白
body:
{"action_type": "monologue", "character_id": "朱丰翰"}
response:
{
    "success": true,
    "message": "动作 monologue 处理成功",
    "error": null,
    "data": {
        "success": true,
        "monologue_sentences": [
            "我叫朱丰翰，今年三十一岁，身处国企工作，过着平凡的生活。我的父亲已经八十岁了，年纪大了，常常坐在摇椅上，晒着太阳，午睡时脸上挂着慈祥的笑容。每次中午下班回家，看到他那样，我的心里总是感到一阵温暖。然而，最近发生的事情让我心情沉重。",
            "除夕那天，我收到了来自远方表亲的来信，得知我的大伯朱立杰过世了。这个消息如同晴天霹雳，尤其是对我父亲来说，他的伤心让我心痛不已。看着他因为失去亲人而伤心欲绝，甚至昏睡过去，我感到无能为力。或许在他心里，最大的心病就是我还没有结婚。身边有那么多优秀的女孩子，但我心里似乎总有一个特别喜欢的女孩，却怎么也想不起来她是谁。",
            "我的弟弟丰震，年纪轻轻就辍学了，自己创业却屡屡失败。他总是向家里要钱，尤其是向父亲要，我知道父亲的退休金所剩无几，心里很不满。我曾告诉他，不要总是依赖父亲，如果缺钱就来找我。可他却像个无底洞，越要越多，甚至有时候我拿不出钱来，还得向朋友借。每次吵架后，我心里都很无奈，明明是为了他好，却总是得不到一点感激。",
            "现在，我的生活似乎被这些琐事缠绕着，心里充满了困惑。面对父亲的忧虑和弟弟的无理，我不知道该如何去平衡这一切。或许，我也该认真思考一下自己的未来，尤其是那位我心中挂念的女孩。可我又不知道该如何去寻找她，或者说，我是否还有勇气去追寻那份幸福。"
        ],
        "character_id": "朱丰翰",
        "current_phase": "initialization"
    },
    "game_state": {
        "game_id": "game_ce20a9d1-f22a-468d-b9a4-e2a2eea8357c",
        "script_id": "21",
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "current_act": 1,
        "current_phase": "initialization",
        "max_acts": 3,
        "player_count": 1,
        "character_count": 5,
        "created_at": "2025-07-18T14:11:04.182066Z",
        "updated_at": "2025-07-18T14:15:02.344102Z",
        "started_at": "2025-07-18T14:11:04.182066Z",
        "completed_at": null
    }
}
# Process Game Action 推进幕次
body:
{
    "action_type": "advance_phase",
    "target_phase": "qna"
}
response:

# Process Game Action QNA

body:
{
    "action_type": "qna",
    "character_id": "朱丰翰",
    "question": "老大，我丢了二十万，你最近刚买了新车，这事你怎么看？",
    "questioner_id": "神探李"
}
response:
{
    "success": true,
    "message": "动作 qna 处理成功",
    "error": null,
    "data": {
        "success": true,
        "question": "老大，我丢了二十万，你最近刚买了新车，这事你怎么看？",
        "answer": "老弟，你丢了二十万？这可真是个大事啊。我最近买了新车，心里也有些紧张，毕竟这笔钱对我来说也不是小数目。你怎么会丢这么多钱？是投资失败了，还是其他什么原因？我知道你最近的情况不太好，别再让父亲担心了。我们家现在的经济状况也不太宽裕，我也不想再给他添麻烦。你有没有想过怎么解决这个问题？",
        "character_id": "朱丰翰",
        "questioner_id": "神探李",
        "qna_id": "6ea73cf8-8ed9-4514-bc15-f74d1982c783",
        "remaining_questions": 2,
        "current_phase": "qna"
    },
    "game_state": {
        "game_id": "game_ce20a9d1-f22a-468d-b9a4-e2a2eea8357c",
        "script_id": "21",
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "current_act": 1,
        "current_phase": "qna",
        "max_acts": 3,
        "player_count": 1,
        "character_count": 5,
        "created_at": "2025-07-18T14:11:04.182066Z",
        "updated_at": "2025-07-18T14:17:13.455970Z",
        "started_at": "2025-07-18T14:11:04.182066Z",
        "completed_at": null
    }
}

# StartNewGame
body:
{
    "action_type": "advance_act"
}
response:
{
    "success": true,
    "message": "动作 advance_act 处理成功",
    "error": null,
    "data": {
        "success": true,
        "new_act": 2,
        "current_phase": "monologue",
        "max_acts": 3,
        "players_reset": 1
    },
    "game_state": {
        "game_id": "game_ce20a9d1-f22a-468d-b9a4-e2a2eea8357c",
        "script_id": "21",
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "current_act": 2,
        "current_phase": "monologue",
        "max_acts": 3,
        "player_count": 1,
        "character_count": 5,
        "created_at": "2025-07-18T14:11:04.182066Z",
        "updated_at": "2025-07-18T14:35:30.513520Z",
        "started_at": "2025-07-18T14:11:04.182066Z",
        "completed_at": null
    }
}
# StartNewGame
body:
{
    "action_type": "advance_phase",
    "target_phase": "final_choice"
}
response:
{
    "success": true,
    "message": "动作 advance_phase 处理成功",
    "error": null,
    "data": {
        "success": true,
        "new_phase": "final_choice",
        "current_act": 2
    },
    "game_state": {
        "game_id": "game_ce20a9d1-f22a-468d-b9a4-e2a2eea8357c",
        "script_id": "21",
        "session_id": "session_8bdc81e8-be2e-4b57-aadb-4a26b0e45eb2",
        "current_act": 2,
        "current_phase": "final_choice",
        "max_acts": 3,
        "player_count": 1,
        "character_count": 5,
        "created_at": "2025-07-18T14:11:04.182066Z",
        "updated_at": "2025-07-18T14:35:42.712160Z",
        "started_at": "2025-07-18T14:11:04.182066Z",
        "completed_at": null
    }
}
# StartNewGame
body:
{
    "action_type": "final_choice",
    "tell_truth": true
}
response:
{
    "success": false,
    "message": null,
    "error": "Unknown action type: final_choice",
    "data": null,
    "game_state": null
}