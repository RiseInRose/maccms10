var eWave = {
  'Image': {
    'Lazyload': function () {
      $(".lazyload").lazyload({
        effect: "fadeIn",
        threshold: 200,
        failurelimit: 50,
        skip_invisible: false
      });
    }
  },
  'Digg': {
    'Init': function () {
      $('body').on('click', '.ewave_digg_link', function (e) {
        var $that = $(this);
        if ($that.attr("data-id")) {
          MAC.Ajax(maccms.path + '/index.php/ajax/digg.html?mid=' + $that.attr("data-mid") + '&id=' + $that.attr("data-id") + '&type=' + $that.attr("data-type"), 'get', 'json', '', function (r) {
            if (r.code == 1) {
              if ($that.attr("data-type") == 'up') {
                $that.find('.digg_num').html(r.data.up);
              } else {
                $that.find('.digg_num').html(r.data.down);
              }
            } else {
              MAC.Pop.Msg(100, 20, r.msg, 1000);
            }
          });

        }
      });
    }
  },
  'Star': {
    'Static': 0, //判断页面是否为静态
    'Obj': '.ewave_star',
    'Init': function () {
      if ($(eWave.Star.Obj).length == 0) {
        return;
      }
      if (eWave.Star.Static == 0) {
        eWave.Star.View();
      } else {
        MAC.Ajax(maccms.path + '/index.php/ajax/score?mid=' + $(eWave.Star.Obj).attr('data-mid') + '&id=' + $(eWave.Star.Obj).attr('data-id'), 'get', 'json', '', function (e) {
          $(eWave.Star.Obj).attr({
            'score': e.data.score,
            'data-star': Math.ceil(e.data.score / 2),
            'data-score-num': e.data.score_num
          });
          $(".raty-score-num").text(e.data.score);
          eWave.Star.View();
        });
      }
    },
    'Get': function () {
      MAC.Ajax(maccms.path + '/index.php/ajax/score?mid=' + $(eWave.Star.Obj).attr('data-mid') + '&id=' + $(eWave.Star.Obj).attr('data-id'), 'get', 'json', '', function (e) {
        $(eWave.Star.Obj).attr({
          'score': e.data.score,
          'data-star': Math.ceil(e.data.score / 2),
          'data-score-num': e.data.score_num
        });
        $(".raty-score-num").text(e.data.score);
        eWave.Star.View();
      });
    },
    'View': function () {
      $(eWave.Star.Obj).raty({
        starType: 'li',
        number: 5,
        numberMax: 5,
        space: false,
        score: function () {
          $(".raty-score-num").text($(eWave.Star.Obj).attr('score'));
          return $(eWave.Star.Obj).attr('data-star');
        },
        hints: ['Rất tệ', 'Tệ hơn', 'Được', 'Đề nghị', 'Khuyến nghị'],
        starOff: '',
        starOn: 'active',
        target: $("#ratewords"),
        targetKeep: $(eWave.Star.Obj).attr('data-score-num') > 0 ? true : false,
        targetText: '暂无',
        click: function (score, evt) {
          MAC.Ajax(maccms.path + '/index.php/ajax/score?mid=' + $(eWave.Star.Obj).attr('data-mid') + '&id=' + $(eWave.Star.Obj).attr('data-id') + '&score=' + (score * 2), 'get', 'json', '', function (r) {
            if (r.code == 1) {
              $(eWave.Star.Obj).attr({
                'score': r.data.score,
                'data-star': Math.ceil(r.data.score / 2),
                'data-score-num': r.data.score_num
              });
              $(".raty-score-num").text(r.data.score);
              $(eWave.Star.Obj).raty('set', {
                'score': Math.ceil(r.data.score / 2),
              });
              MAC.Pop.Msg(100, 20, '评分成功', 1000);
            } else {
              $(eWave.Star.Obj).raty('score', $(eWave.Star.Obj).attr('data-star'));
              MAC.Pop.Msg(100, 20, r.msg, 1000);
            }
          }, function () {
            $(eWave.Star.Obj).raty('score', $(eWave.Star.Obj).attr('data-star'));
            MAC.Pop.Msg(100, 20, '网络异常', 1000);
          });
        }
      });
    }
  },
  'Comment': {
    'Login': 0,
    'Verify': 0,
    'Init': function () {
      $('body').on('click', '.comment_face_box img', function (e) {
        var obj = $(this).parent().parent().parent().find('.comment_content');
        MAC.AddEm(obj, $(this).attr('data-id'));
      });
      $('body').on('click', '.comment_face_panel', function (e) {
        // $('.comment_face_box').toggle();
        $(this).parent().find('.comment_face_box').toggle();
      });
      $('body').on('keyup', '.comment_content', function (e) {
        var obj = $(this).parent().parent().parent().parent().find('.comment_remaining');
        MAC.Remaining($(this), 200, obj)
      });
      $('body').on('focus', '.comment_content', function (e) {
        if (eWave.Comment.Login == 1 && MAC.User.IsLogin != 1) {
          MAC.User.Login();
        }
      });
      $("body").on("click", ".ewave-comment-reply-switch", function () {
        $($(this).attr("to")).slideToggle("fast");
        $(".ewave-comment-reply-form").not($(this).attr("to")).slideUp("fast");
      });
      $('body').on('click', '.comment_report', function (e) {
        var $that = $(this);
        if ($(this).attr("data-id")) {
          $.ajax({
            url: maccms.path + '/index.php/comment/report.html?id=' + $that.attr("data-id"),
            cache: false,
            dataType: 'json',
            success: function ($r) {
              $that.addClass('disabled');
              MAC.Pop.Msg(100, 20, $r.msg, 1000);
              if ($r.code == 1) {}
            }
          });
        }
      });

      $('body').on('click', '.comment_submit', function (e) {
        var $that = $(this);
        eWave.Comment.Submit($that);
      });

    },
    'Show': function ($page) {
      if ($(".ewave_comment").length > 0) {
        $.ajax({
          type: 'get',
          url: maccms.path + '/index.php/comment/ajax.html?rid=' + $('.ewave_comment').attr('data-id') + '&mid=' + $('.ewave_comment').attr('data-mid') + '&page=' + $page,
          timeout: 5000,
          error: function () {
            $(".ewave_comment").html('<a href="javascript:void(0)" onclick="eWave.Comment.Show(' + $page + ')">评论加载失败，点击我刷新...</a>');
          },
          success: function ($r) {
            $(".ewave_comment").html($r);
          }
        });
      }
    },
    'Reply': function ($o) {

    },
    'Submit': function ($o) {
      var form = $o.parents('form');
      if ($(form).find(".comment_content").val() == '') {
        MAC.Pop.Msg(100, 20, '请输入评论！', 1000);
        return false;
      }
      if ($('.ewave_comment').attr('data-mid') == '') {
        MAC.Pop.Msg(100, 20, '模块mid错误！', 1000);
        return false;
      }
      if ($('.ewave_comment').attr('data-id') == '') {
        MAC.Pop.Msg(100, 20, '关联id错误！', 1000);
        return false;
      }

      $.ajax({
        type: 'post',
        url: maccms.path + '/index.php/comment/saveData',
        data: $(form).serialize() + '&comment_mid=' + $('.ewave_comment').attr('data-mid') + '&comment_rid=' + $('.ewave_comment').attr('data-id'),
        success: function ($r) {
          MAC.Pop.Msg(100, 20, $r.msg, 1000);
          if ($r.code == 1) {
            eWave.Comment.Show(1);
          } else {
            if (eWave.Comment.Verify == 1) {
              form.find(".ewave-comment-verify-img").attr('src', maccms.path + '/index.php/verify/index.html?r=' + Math.random());
            }
          }
        }
      });
    }
  },
  'Gbook': {
    'Login': 0,
    'Verify': 0,
    'Init': function () {
      $('body').on('keyup', '.gbook_content', function (e) {
        MAC.Remaining($(this), 200, '.gbook_remaining')
      });
      $('body').on('focus', '.gbook_content', function (e) {
        if (eWave.Gbook.Login == 1 && MAC.User.IsLogin != 1) {
          $(".gbook_content").blur();
          MAC.User.Login();
        }
      });
      $('body').on('click', '.gbook_submit', function (e) {
        eWave.Gbook.Submit();
      });
    },
    'Show': function ($page) {
      MAC.Ajax(maccms.path + '/index.php/gbook/index?page=' + $page, 'post', 'json', '', function (r) {
        $(".mac_gbook_box").html(r);
      }, function () {
        $(".mac_gbook_box").html('Tải bình luận thất bại, vui lòng làm mới...');
      });
    },
    'Submit': function () {
      if ($(".gbook_content").val() == '') {
        MAC.Pop.Msg(100, 20, 'Vui lòng nhập bình luận của bạn!', 1000);
        return false;
      }
      MAC.Ajax(maccms.path + '/index.php/gbook/saveData', 'post', 'json', $('.gbook_form').serialize(), function (r) {
        MAC.Pop.Msg(100, 20, r.msg, 1000);
        if (r.code == 1) {
          location.reload();
        } else {
          if (eWave.Gbook.Verify == 1) {
            $(".gbook_form").find(".ewave-comment-verify-img").attr('src', maccms.path + '/index.php/verify/index.html?r=' + Math.random());
          }
        }
      });
    },
    'Report': function (name, id) {
      MAC.Pop.Show(400, 300, 'Lỗi dữ liệu', maccms.path + '/index.php/gbook/report.html?id=' + id + '&name=' + encodeURIComponent(name), function (r) {
        $(".gbook_content").focus();
        $(".mac_verify_img_report").click();
      });
    }
  },
  'Ulog': {
    'Init': function () {
      eWave.Ulog.Set();
      eWave.Ulog.Click();

    },
    'Get': function () {
      MAC.Ajax(maccms.path + '/index.php/user/ajax_ulog/?ac=list&limit=2000&type=2', 'get', 'json', '', function (r) {
        if (r.code == 1) {
          $.each(r['list'], function (index, row) {
            if (row.ulog_type == 2) {
              $("#detail-fav-" + row.data.id).removeAttr("data-id").html('<i class="fa fa-star"></i>Đã lưu');
              $("#player-fav-" + row.data.id).removeAttr("data-id").children("a").text('Đã lưu');
            }
          });
        } else {

        }
      });
    },
    'Set': function () {
      if ($(".ewave_ulog_set").attr('data-mid')) {
        var $that = $(".ewave_ulog_set");
        $.get(maccms.path + '/index.php/user/ajax_ulog/?ac=set&mid=' + $that.attr("data-mid") + '&id=' + $that.attr("data-id") + '&sid=' + $that.attr("data-sid") + '&nid=' + $that.attr("data-nid") + '&type=' + $that.attr("data-type"));
      }
    },
    'Click': function () {
      $('body').on('click', '.ewave_ulog', function (e) {

        //是否需要验证登录
        if (MAC.User.IsLogin == 0) {
          MAC.User.Login();
          return;
        }

        var $that = $(this);
        if ($that.attr("data-id")) {
          MAC.Ajax(maccms.path + '/index.php/user/ajax_ulog/?ac=set&mid=' + $that.attr("data-mid") + '&id=' + $that.attr("data-id") + '&type=' + $that.attr("data-type"), 'get', 'json', '', function (r) {
            if (r.code == 1) {
              MAC.Pop.Msg(100, 20, 'Bộ sưu tập thành công', 1000);
              $(".detail-ulog").removeAttr("data-id").html('<i class="fa fa-star"></i>Đã lưu');
            } else {
              MAC.Pop.Msg(100, 20, 'Bộ sưu tập thành công', 1000);
            }
          });
        }
      });
    },
  },
}
$(document).ready(function () {
  eWave.Digg.Init();
  eWave.Star.Init();
  eWave.Image.Lazyload();
});
