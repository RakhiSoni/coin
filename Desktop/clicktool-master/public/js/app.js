/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).on('submit', '.ajax-login', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  var params = {
    email: $('input[name=email]').val(),
    password: $('input[name=password]').val()
  };
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: JSON.stringify(params),
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
    },
    success: function(json) {
      if (json && json._id) {
        $.post('/login', json, function(res) {
          if (res.status == 200) {
            window.location.href = '/users/dashboard';
          }
        });
      }
    },
    error: function(error) {
      if (error.responseJSON.error) {
        $.toast({
          heading: 'Error',
          text: error.responseJSON.error.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
        $('button[type=submit]')
          .html(btn)
          .removeAttr('style');
      } else {
        $.toast({
          heading: 'Error',
          text: error.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
        $('button[type=submit]')
          .html(btn)
          .removeAttr('style');
      }
    }
  });
});

$(document).on('submit', '.ajax-reset-password', function(e) {
  e.preventDefault();
  var token = $('input[name=token]').val();
  var password = $('input[name=password]').val();
  var c_password = $('input[name=c_password]').val();
  if (password.trim() == '' || password.trim() != c_password.trim()) {
    $.toast({
      heading: 'Error',
      text: 'Password and confirm password must be same.',
      showHideTransition: 'slide',
      icon: 'error'
    });
    return false;
  }
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: { token: token, password: password },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200 && json.error == 0) {
        $('.password-reset-successfully').click();
        setTimeout(function() {
          window.location.href = '/';
        }, 500);
      }
    },
    complete: function(message) {
      if (message.responseJSON && message.responseJSON.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        setTimeout(function() {
          window.location.href = '/';
        }, 500);
      } else if (message.error == 1 || message.statusCode == 400) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
        //                $('.ajax-forgot-password .error').html(message.message);
      } else if (message.status == 200) {
        $.toast({
          heading: 'Success',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        setTimeout(function() {
          window.location.href = '/';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.ajax-register', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function(json) {
      if (json.status == 200 && json.error == 0) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/users/dashboard';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
      } else if (message.error == 1 || message.status == 400) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.ajax-forgot-password', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function(json) {
      //            (json);
      message = json;
      if (json.statusCode == 200 && json.error == 0) {
        $('.success-forgot-password').click();
      }
    },
    complete: function(message) {
      message;
      if (message.responseJSON && message.responseJSON.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('#Modal-forgot-password').modal('toggle');
        //                $('.ajax-forgot-password .error').html(message.responseJSON.message);
      } else if (message.error == 1 || message.statusCode == 400) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
        //                $('.ajax-forgot-password .error').html(message.message);
      } else {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('click', '.download_key', function() {
  var walletName = $('.walletName').html();
  var walletAddress = $('.walletAddress').html();
  var privateKey = $('.privateKey').val();
  var obj = { walletAddress: walletAddress, privateKey: privateKey };
  var data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
  $(this).attr('href', 'data:' + data);
  $(this).attr('download', walletName.replace(' ', '_') + '.json');
  $(this).trigger();
});

$(document).on('click', '.copy_mnemonic', function() {
  var copyText = document.getElementById('generatedMnemonic');
  copyText.select();
  document.execCommand('copy');
  $.toast({
    heading: 'Copied the text',
    text: copyText.value,
    showHideTransition: 'slide',
    icon: 'success'
  });
});

$(document).on('click', '.copy_refarral', function() {
  var copyText = document.getElementById('refrral_code');
  copyText.select();
  document.execCommand('copy');
  document.getElementById('refrral_code').disabled = true;
  $.toast({
    heading: 'Copied the text',
    text: copyText.value,
    showHideTransition: 'slide',
    icon: 'success'
  });
  document.getElementById('refrral_code').disabled = false;
});

$(document).on('submit', '.verifyMnemonic', function(e) {
  e.preventDefault();
  var wordCount = $('textarea.mnemonic')
    .val()
    .split(' ').length;
  if (wordCount == 12) {
    var btn = $('button[type=submit]').html();
    $('button[type=submit]')
      .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
      .attr('style', 'pointer-events:none');
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      success: function(json) {
        if (json.status == 200 && json.error == 0) {
          //                    $('.verifyMnemonic .success').html(json.message);
          $.toast({
            heading: 'Success',
            text: json.message,
            showHideTransition: 'slide',
            icon: 'success'
          });
          $('button[type=submit]').html('Submit');
          window.location.href = '/users/dashboard';
        } else {
          $.toast({
            heading: 'Error',
            text: json.message,
            showHideTransition: 'fade',
            icon: 'error'
          });
          $('.verifyMnemonic .error').html();
          $('button[type=submit]')
            .html('Submit')
            .removeAttr('style');
        }
      }
    });
  } else {
    $.toast({
      heading: 'Error',
      text: 'Mnemonic Phrase should contains exact 12 words',
      showHideTransition: 'fade',
      icon: 'error'
    });
    //        $('.verifyMnemonic .error').html('Mnemonic Phrase should contains exact 12 words');
    return false;
  }
});

$(document).on('focus', 'textarea.mnemonic', function() {
  $('.verifyMnemonic .error').html('');
});

$(document).on('click', '.delete_model_popup', function() {
  var id = $(this).data('bind');
  $('.delete_wallet_confirm').attr('id', id);
});

$(document).on('click', '.delete_wallet_confirm', function() {
  var button = $(this);
  button.html('<i class="fa fa-spinner fa-spin fa-2x"></i> ').attr('style', 'pointer-events:none');
  var id = $(this).attr('id');
  $.ajax({
    type: 'POST',
    url: '/users/deleteWallet',
    data: { id: id },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200 && json.error == 0) {
        $('.errors-wallet')
          .addClass('success')
          .removeClass('error');
        //                $('.errors-wallet').html(json.message);
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('#delete-' + id).remove();
        $('#Modal-delete').modal('toggle');
        button.html('Yes').removeAttr('style');
      } else {
        $('.errors-wallet')
          .addClass('error')
          .removeClass('success');
        //                $('.errors-wallet').html(json.message);
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('#Modal-delete').modal('toggle');
        button.html('Yes').removeAttr('style');
      }
    }
  });
});

$(document).on('click', '.default_model_popup', function() {
  var id = $("input[name='choose_wallet']:checked").val();
  $('.default_wallet_confirm').attr('id', id);
});

$(document).on('click', '.close_wallet_confirm', function() {
  window.location.href = '/users/wallets';
});

$(document).on('click', '.default_wallet_confirm', function() {
  var button = $(this);
  button.html('<i class="fa fa-spinner fa-spin fa-2x"></i> ').attr('style', 'pointer-events:none');
  var id = $(this).attr('id');
  $.ajax({
    type: 'POST',
    url: '/users/defaultWallet',
    data: { id: id },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200 && json.error == 0) {
        $('.errors-wallet')
          .addClass('success')
          .removeClass('error');
        //                $('.errors-wallet').html(json.message);
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('#Modal-set-default').modal('toggle');
        button.html('Yes').removeAttr('style');
      } else {
        $('.errors-wallet')
          .addClass('error')
          .removeClass('success');
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        //                $('.errors-wallet').html(json.message);
        $('#Modal-set-default').modal('toggle');
        button.html('Yes').removeAttr('style');
      }
    }
  });
});

$(document).on('submit', '.sendInquiry', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function(json) {
      if (json.statusCode == 200) {
        $('.buyError')
          .addClass('success')
          .removeClass('error');
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        //                $('.buyError.success').html(json.message);
        $('button[type=submit]').html('Submit');
        $('textarea').val('');
      } else {
        $('.buyError')
          .addClass('error')
          .removeClass('success');
        //                $('.buyError.error').html(json.message);
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(error) {
      $('.buyError')
        .addClass('error')
        .removeClass('success');
      //            $('.buyError.error').html(error.responseJSON.message);
      $.toast({
        heading: 'Error',
        text: error.responseJSON.message,
        showHideTransition: 'fade',
        icon: 'error'
      });
      $('button[type=submit]')
        .html('Submit')
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.editWallet', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function(json) {
      if (json.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        window.location.href = '/users/wallets';
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    }
  });
});

$(document).on('submit', '.buyWithBTC', function(e) {
  e.preventDefault();
  $.toast({
    heading: 'Native Wallet',
    text: 'This functionality is under Process',
    showHideTransition: 'fade',
    icon: 'error'
  });
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function(json) {
      json;
      //            return false;
      if (json.status == 200) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        window.location.href = json.invoice.url;
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    }
  });
});

$(document).on('click', '.downloadStatements', function(e) {
  e.preventDefault();
  var button = $(this);
  button.attr('style', 'pointer-events:none');
  var statement_type = $('.statementtype').val();
  var url = $(this).attr('href');
  $.ajax({
    type: 'POST',
    url: url,
    data: { statement_type: statement_type },
    dataType: 'json',
    success: function(json) {
      json;
      //            return false;
      if (json.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        //                window.location.href = json.data.url;
        $('.downloadbutton').attr('href', json.data.url);
        $('.downloadbutton')
          .get(0)
          .click();
        button.removeAttr('style');
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        button.removeAttr('style');
      }
    }
  });
});

$('#profilePicture').change(function() {
  let path = this.files[0].name;
  let extention = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
  if (
    extention.toLowerCase() == 'jpg' ||
    extention.toLowerCase() == 'png' ||
    extention.toLowerCase() == 'svg' ||
    extention.toLowerCase() == 'tiff' ||
    extention.toLowerCase() == 'jpeg' ||
    extention.toLowerCase() == 'gif'
  ) {
    if (size < 2097152) {
      let reader = new FileReader();
      reader.onload = function(e) {
        $('.profile-pic').attr('src', e.target.result);
      };
      reader.readAsDataURL(this.files[0]);
    } else {
      $.toast({
        heading: 'Error',
        text: 'Image Size is to large . please select up to 2mb size.',
        showHideTransition: 'slide',
        icon: 'error'
      });
    }
  } else {
    $.toast({
      heading: 'Error',
      text: 'Please Select Image file.',
      showHideTransition: 'slide',
      icon: 'error'
    });
  }
});

$(document).on('submit', '.updateProile', function(e) {
  e.preventDefault();
  var formData = new FormData(this);
  $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    success: function(json) {
      //            return false;
      if (json.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/users/profile';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(error) {
      $.toast({
        heading: 'Error',
        text: error.responseJson.message,
        showHideTransition: 'fade',
        icon: 'error'
      });
      $('button[type=submit]')
        .html('Submit')
        .removeAttr('style');
    }
  });
});

$(document).on('click', '.kycPage', function(e) {
  e.preventDefault();
  var button = $(this);
  button.attr('style', 'pointer-events:none');
  var url = '/users/get-Kyc-status';
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'json',
    success: function(json) {
      if (json.status == 200) {
        if (json.message == 0) {
          window.location.href = '/users/kyc-verification-1';
        } else if (json.message == 1) {
          window.location.href = '/users/kyc-under-review';
        } else if (json.message == 2) {
          window.location.href = '/users/kyc-verified';
        } else if (json.message == 3) {
          window.location.href = '/users/kyc-verification-failed';
        } else {
          window.location.href = '/users/kyc-verification-1';
        }
      } else {
        window.location.href = '/users/kyc-verification-1';
      }
    }
  });
});

function maxLengthCheck(object) {
  if (object.value.length < object.minLength) {
    object.setCustomValidity('value must be greater than 7 or equal to 13 !');
  } else {
    object.setCustomValidity('');
  }
  if (object.value.length > object.maxLength) object.value = object.value.slice(0, object.maxLength);
  return true;
}

function minLengthCheck(event) {
  var k = event ? event.which : window.event.keyCode;
  if (k == 32) return false;
}

function kycDateValidation() {
  let chooseDate = new Date($('#dateOfBirth').val());
  let date = chooseDate.getDate();
  let month = chooseDate.getMonth() + 1;
  let year = chooseDate.getFullYear();
  let result = new Date(year + 18, month - 1, date) <= new Date();
  if (result == 0) {
    $('#dateOfBirth').val('');
  }
}

$(document).on('submit', '.kyc-step-1', function(e) {
  e.preventDefault();
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  let select = document.getElementById('country');
  var params = {
    country: select.options[select.selectedIndex].text,
    state: document.getElementById('state').value,
    city: document.getElementById('city').value,
    lastname: document.getElementById('lastname').value,
    firstname: document.getElementById('firstname').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    dateOfBirth: document.getElementById('dateOfBirth').value,
    countryCode: select.value
  };
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: JSON.stringify(params),
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
    },
    success: function(json) {
      if (json.status == 200) {
        // $.toast({
        //   heading: 'Success',
        //   text: json.message,
        //   showHideTransition: 'slide',
        //   icon: 'success'
        // });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/users/kyc-verification-2';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'Error'
        });
      } else if (message.error == 1 || message.status == 400) {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'Error'
        });
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.kyc-step-2', function(e) {
  e.preventDefault();
  let imgValidation1 = document.getElementById('hiddenImg1').value;
  let imgValidation2 = document.getElementById('hiddenImg2').value;
  let imgValidation3 = document.getElementById('hiddenImg3').value;
  if (imgValidation1 != 'undefined' && imgValidation2 != 'undefined' && imgValidation3 != 'undefined') {
    let docID = $('#docID').val();
    let docImage = $('#docImage').get(0).files[0];
    let docHoldingImage = $('#docHoldingImage').get(0).files[0];
    let utilityBill = $('#utilityBill').get(0).files[0];
    let fd = new FormData();
    fd.append('docID', docID);
    fd.append('docImage', docImage);
    fd.append('docHoldingImage', docHoldingImage);
    fd.append('utilityBill', utilityBill);
    $('button[type=submit]')
      .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
      .attr('style', 'pointer-events:none');
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: fd,
      cache: false,
      contentType: false,
      processData: false,
      success: function(json) {
        if (json.status == 200) {
          // $.toast({
          //   heading: 'Success',
          //   text: json.message,
          //   showHideTransition: 'slide',
          //   icon: 'success'
          // });
          $('button[type=submit]')
            .html('Submit')
            .removeAttr('style');
          setTimeout(function() {
            window.location.href = '/users/kyc-verification-3';
          }, 500);
        } else {
          $.toast({
            heading: 'Error',
            text: json.message,
            showHideTransition: 'fade',
            icon: 'error'
          });
          $('button[type=submit]')
            .html('Submit')
            .removeAttr('style');
        }
      },
      error: function(error) {
        $.toast({
          heading: 'Error',
          text: error.responseJson.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    });
  } else {
    $.toast({
      heading: 'Error',
      text: 'Please Select Image file.',
      showHideTransition: 'fade',
      icon: 'error'
    });
  }
});

$(document).on('submit', '.kyc-step-3', function(e) {
  e.preventDefault();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    cache: false,
    contentType: false,
    processData: false,
    success: function(json) {
      if (json.status == 200) {
        $.toast({
          heading: 'Success',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/users/kyc-under-review';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(error) {
      $.toast({
        heading: 'Error',
        text: error.responseJson.message,
        showHideTransition: 'fade',
        icon: 'error'
      });
      $('button[type=submit]')
        .html('Submit')
        .removeAttr('style');
    }
  });
});

$(document).on('change', '.KycImg1', function(e) {
  let value = document.getElementsByClassName('KycImg1');
  let path = value[0].value;
  let extention = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
  if (
    extention.toLowerCase() == 'jpg' ||
    extention.toLowerCase() == 'png' ||
    extention.toLowerCase() == 'svg' ||
    extention.toLowerCase() == 'tiff' ||
    extention.toLowerCase() == 'jpeg' ||
    extention.toLowerCase() == 'gif'
  ) {
    document.getElementById('hiddenImg1').value = '';
  } else {
    document.getElementById('hiddenImg1').value = 'undefined';
  }
});

$(document).on('change', '.KycImg2', function(e) {
  let value = document.getElementsByClassName('KycImg2');
  let path = value[0].value;
  let extention = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
  if (
    extention.toLowerCase() == 'jpg' ||
    extention.toLowerCase() == 'png' ||
    extention.toLowerCase() == 'svg' ||
    extention.toLowerCase() == 'tiff' ||
    extention.toLowerCase() == 'jpeg' ||
    extention.toLowerCase() == 'gif'
  ) {
    document.getElementById('hiddenImg2').value = '';
  } else {
    document.getElementById('hiddenImg2').value = 'undefined';
  }
});

$(document).on('change', '.KycImg3', function(e) {
  let value = document.getElementsByClassName('KycImg3');
  let path = value[0].value;
  let extention = path.substring(path.lastIndexOf('.') + 1, path.length) || path;
  if (
    extention.toLowerCase() == 'jpg' ||
    extention.toLowerCase() == 'png' ||
    extention.toLowerCase() == 'svg' ||
    extention.toLowerCase() == 'tiff' ||
    extention.toLowerCase() == 'jpeg' ||
    extention.toLowerCase() == 'gif'
  ) {
    document.getElementById('hiddenImg3').value = '';
  } else {
    document.getElementById('hiddenImg3').value = 'undefined';
  }
});

function setStates() {
  let countryName = document.getElementById('country').value;
  document.getElementById('state').innerHTML = '';
  $.ajax({
    type: 'POST',
    url: '/api/users/state-list',
    data: {
      countryName: countryName
    },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200) {
        let opt;
        let select = document.getElementById('state');
        for (let i = 0; i <= json.data.length; i++) {
          opt = document.createElement('option');
          opt.value = json.data[i];
          opt.textContent = json.data[i];
          select.appendChild(opt);
        }
        setCities();
      } else {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message) {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
      } else if (message.error == 1 || message.status == 400) {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
      }
    }
  });
}

function setCities() {
  let countryName = document.getElementById('country').value;
  let stateName = document.getElementById('state').value;
  document.getElementById('city').innerHTML = '';
  $.ajax({
    type: 'POST',
    url: '/api/users/city-list',
    data: {
      countryName: countryName,
      stateName: stateName
    },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200) {
        let opt;
        let select = document.getElementById('city');
        for (let i = 0; i <= json.data.length; i++) {
          opt = document.createElement('option');
          opt.value = json.data[i];
          opt.textContent = json.data[i];
          select.appendChild(opt);
        }
      } else {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message) {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
      } else if (message.error == 1 || message.status == 400) {
        $.toast({
          heading: 'Error',
          text: 'Please Select country again from the list.!!',
          showHideTransition: 'fade',
          icon: 'error'
        });
      }
    }
  });
}
