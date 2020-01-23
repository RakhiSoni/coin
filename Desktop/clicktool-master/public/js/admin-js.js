function minLengthCheck(event) {
  var k = event ? event.which : window.event.keyCode;
  if (k == 32) return false;
}

function maxLengthCheck(object) {
  if (object.value.length < object.minLength) {
    object.setCustomValidity('value must be greater than 7 or equal to 13 !');
  } else {
    object.setCustomValidity('');
  }
  if (object.value.length > object.maxLength) object.value = object.value.slice(0, object.maxLength);
  return true;
}

$(document).on('click', '#kyc-approve', function(e) {
  e.preventDefault();
  let id = document.getElementById('hiddenId').value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: '/admin/kyc-status-update/' + id,
    data: { status: 2 },
    dataType: 'json',
    success: function(json) {
      if (json.statusCode == 200) {
        document.getElementById('kycAcceptMsg').innerHTML = json.message;
        $('#sent-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/kyc-request';
        }, 3000);
      } else {
        document.getElementById('kycError').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        document.getElementById('kycError').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        document.getElementById('kycError').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.kyc-reject', function(e) {
  e.preventDefault();
  let reason = document.getElementsByClassName('kycRejectMsg')[0].value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: { status: 3, reason: reason },
    dataType: 'json',
    success: function(json) {
      if (json.statusCode == 200) {
        $('#reject-modal').modal('hide');
        document.getElementById('kycRejectMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/kyc-request';
        }, 3000);
      } else {
        $('#reject-modal').modal('hide');
        document.getElementById('kycError').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        $('#reject-modal').modal('hide');
        document.getElementById('kycError').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        $('#reject-modal').modal('hide');
        document.getElementById('kycError').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.generalToken', function(e) {
  $('#general').attr('disabled', true);
  e.preventDefault();
  let select = document.getElementById('generalCurrency');
  let address = document.getElementById('walletAdd').value;
  let tokens = document.getElementById('generalToken').value;
  let amount = document.getElementById('generalAmout').value;
  let currency = select.options[select.selectedIndex].value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: { address: address, tokens: tokens, amount: amount, currency: currency },
    dataType: 'json',
    success: function(json) {
      $('#general').attr('disabled', false);
      if (json.statusCode == 200) {
        document.getElementById('successMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/token-transfer';
        }, 3000);
      } else {
        document.getElementById('failedMsg').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      $('#general').attr('disabled', false);
      if (message.responseJSON) {
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.userToken', function(e) {
  $('#user').attr('disabled', true);
  e.preventDefault();
  let select = document.getElementById('userCurrency');
  let email = document.getElementById('userEmail').value;
  let tokens = document.getElementById('userToken').value;
  let amount = document.getElementById('userAmount').value;
  let currency = select.options[select.selectedIndex].value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: { user: email, tokens: tokens, amount: amount, currency: currency },
    dataType: 'json',
    success: function(json) {
      $('#user').attr('disabled', false);
      if (json.statusCode == 200) {
        document.getElementById('successMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/token-transfer';
        }, 3000);
      } else {
        document.getElementById('failedMsg').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      $('#user').attr('disabled', false);
      if (message.responseJSON) {
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('submit', '.createUser', function(e) {
  $('#userCreate').attr('disabled', true);
  e.preventDefault();
  let select = document.getElementById('code');
  let email = document.getElementById('email').value;
  let firstname = document.getElementById('fname').value;
  let lastname = document.getElementById('lname').value;
  let phone = document.getElementById('phone').value;
  let countryCode = select.options[select.selectedIndex].value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: { firstname: firstname, lastname: lastname, email: email, phone: phone, countryCode: countryCode },
    dataType: 'json',
    success: function(json) {
      if (json.status == 200) {
        $('#userCreate').modal('hide');
        document.getElementById('successMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/users';
        }, 3000);
      } else {
        $('#userCreate').modal('hide');
        document.getElementById('failedMsg').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        $('#userCreate').modal('hide');
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        $('#userCreate').modal('hide');
        document.getElementById('failedMsg').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
});

$(document).on('click', '#loginBtn', function(e) {
  e.preventDefault();
  let userName = document.getElementById('userName').value;
  let password = document.getElementById('password').value;
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: '/admin/login',
    data: { userName: userName, password: password },
    dataType: 'json',
    success: function(json) {
      if (json.statusCode == 200) {
        window.location.href = '/admin/dashboard';
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

function kycTabulation() {
  let id = document.querySelector('.kyc-tab').id;
  localStorage.setItem('kyc-tab', id);
}

function adminProfile() {
  let userName = $('#adminUserName').val();
  let profile = $('#adminProfile').get(0).files[0];
  let formData = new FormData();
  formData.append('profilePicture', profile);
  formData.append('username', userName);
  console.log(userName);
  var btn = $('button[type=submit]').html();
  $('button[type=submit]')
    .html('<i class="fa fa-spinner fa-spin fa-2x"></i> ')
    .attr('style', 'pointer-events:none');
  $.ajax({
    type: 'POST',
    url: '/admin/updateProfile',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    success: function(json) {
      if (json.statusCode == 200) {
        document.getElementById('ProfileMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
        setTimeout(function() {
          window.location.href = '/admin/profile';
        }, 3000);
      } else {
        document.getElementById('ProfileFailedMsg').innerHTML = json.message;
        $('#failed-modal').modal('show');
        $('button[type=submit]')
          .html('Submit')
          .removeAttr('style');
      }
    },
    error: function(message) {
      if (message.responseJSON) {
        document.getElementById('ProfileFailedMsg').innerHTML = message.responseJSON.message;
        $('#failed-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        document.getElementById('ProfileFailedMsg').innerHTML = message.responseJSON.message.message;
        $('#failed-modal').modal('show');
      }
      $('button[type=submit]')
        .html(btn)
        .removeAttr('style');
    }
  });
}

$(document).on('change', '#adminProfile', function(e) {
  let path = this.files[0].name;
  let size = this.files[0].size;
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
        $('.admin-profile-pic').attr('src', e.target.result);
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

$('#clearModelData').on('click', function() {
  $('#oldPass').val('');
  $('#newPass').val('');
  $('#confirmPass').val('');
});

$(document).on('submit', '.admin-change-password', function(e) {
  e.preventDefault();
  $('#btnChngPass').attr('disabled', true);
  let password = document.getElementById('oldPass').value;
  let newPassword = document.getElementById('newPass').value;
  let confirmPass = document.getElementById('confirmPass').value;
  if (newPassword != confirmPass) {
    $.toast({
      heading: 'Error',
      text: 'New Password and Confirm Password does not match.',
      showHideTransition: 'slide',
      icon: 'error'
    });
    $('#btnChngPass').attr('disabled', false);
  } else {
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: JSON.stringify({ newPassword: newPassword, password: password }),
      dataType: 'json',
      contentType: 'application/json',
      success: function(json) {
        $('#btnChngPass').attr('disabled', false);
        if (json.statusCode == 200) {
          $('#modal-change-pw').modal('hide');
          document.getElementById('ProfileMsg').innerHTML = json.message;
          $('#cong-modal').modal('show');
          setTimeout(function() {
            window.location.href = '/admin/profile';
          }, 500);
        } else {
          $.toast({
            heading: 'Error',
            text: json.message,
            showHideTransition: 'slide',
            icon: 'error'
          });
        }
      },
      error: function(message) {
        $('#btnChngPass').attr('disabled', false);
        if (message.responseJSON) {
          $.toast({
            heading: 'Error',
            text: message.responseJSON.message,
            showHideTransition: 'slide',
            icon: 'error'
          });
        } else if (message.error == 1 || message.status == 400) {
          $.toast({
            heading: 'Error',
            text: message.responseJSON.message.message,
            showHideTransition: 'slide',
            icon: 'error'
          });
        }
      }
    });
  }
});

$(document).on('click', '#ajax-next-round', function(e) {
  e.preventDefault();
  $('#ajax-next-round').attr('disabled', true);
  $.ajax({
    type: 'GET',
    url: '/admin/startNextRound',
    data: {},
    dataType: 'json',
    success: function(json) {
      $('#ajax-next-round').attr('disabled', false);
      if (json.statusCode == 200) {
        $('#next-round').modal('hide');
        $('#cong-modal').modal('show');
        setTimeout(function() {
          window.location.href = '/admin/dashboard';
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
      $('#ajax-next-round').attr('disabled', false);
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
    }
  });
});

$(document).on('click', '#ajax-softcape-update', function(e) {
  e.preventDefault();
  $('#ajax-softcape-update').attr('disabled', true);
  let value = document.getElementById('softCapeValue').value;
  $.ajax({
    type: 'POST',
    url: '/admin/updateSoftCap',
    data: { softCap: value },
    dataType: 'json',
    success: function(json) {
      $('#ajax-softcape-update').attr('disabled', false);
      if (json.statusCode == 200) {
        $('#softcape-update').modal('hide');
        document.getElementById('successMsg').innerHTML = json.message;
        $('#cong-modal').modal('show');
        setTimeout(function() {
          window.location.href = '/admin/dashboard';
        }, 500);
      } else {
        $('#softcape-update').modal('hide');
        document.getElementById('errorMsg').innerHTML = json.message;
        $('#success-modal').modal('show');
      }
    },
    error: function(message) {
      $('#ajax-softcape-update').attr('disabled', false);
      if (message.responseJSON) {
        $('#softcape-update').modal('hide');
        document.getElementById('errorMsg').innerHTML = message.responseJSON.message;
        $('#success-modal').modal('show');
      } else if (message.error == 1 || message.status == 400) {
        $('#softcape-update').modal('hide');
        document.getElementById('errorMsg').innerHTML = message.responseJSON.message.message;
        $('#success-modal').modal('show');
      }
    }
  });
});

$(document).on('submit', '.admin-forgot-password', function(e) {
  e.preventDefault();
  $('#adminFrgtPass').attr('disabled', true);
  let email = document.getElementById('frgt-email').value;
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: JSON.stringify({ email: email }),
    dataType: 'json',
    contentType: 'application/json',
    success: function(json) {
      $('#adminFrgtPass').attr('disabled', false);
      if (json.statusCode == 200) {
        $('#forgot-pw-modal').modal('hide');
        $('#success-msg').modal('show');
        setTimeout(function() {
          window.location.href = '/admin';
        }, 3000);
      } else {
        $.toast({
          heading: 'Error',
          text: json.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      }
    },
    error: function(message) {
      $('#adminFrgtPass').attr('disabled', false);
      if (message.responseJSON) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      } else if (message.error == 1 || message.status == 400) {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      }
    }
  });
});

$(document).on('submit', '.ajax-admin-reset-password', function(e) {
  e.preventDefault();
  $('#adminResetPass').attr('disabled', true);
  var token = $('#token').val();
  var password = $('#password').val();
  var c_password = $('#c_password').val();
  if (password.trim() == '' || password.trim() != c_password.trim()) {
    $.toast({
      heading: 'Error',
      text: 'Password and confirm password must be same.',
      showHideTransition: 'slide',
      icon: 'error'
    });
    $('#adminResetPass').attr('disabled', false);
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
      $('#adminResetPass').attr('disabled', false);
      if (json.status == 200 && json.error == 0) {
        $('.password-reset-successfully').click();
        setTimeout(function() {
          window.location.href = '/admin';
        }, 500);
      }
    },
    complete: function(message) {
      $('#adminResetPass').attr('disabled', false);
      if (message.responseJSON && message.responseJSON.statusCode == 200) {
        $.toast({
          heading: 'Success',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'success'
        });
        setTimeout(function() {
          window.location.href = '/admin';
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
          window.location.href = '/admin';
        }, 500);
      } else {
        $.toast({
          heading: 'Error',
          text: message.responseJSON.message,
          showHideTransition: 'slide',
          icon: 'error'
        });
      }
    }
  });
});

$('.downloadImage').on('click', function() {
  let getFilePath = $('.img01').attr('src');
  let path = getFilePath.split('/');
  let folderName = path[5];
  let filename = path[6];
  let url = '/admin/download/' + folderName + '/' + filename;
  $('.downloadLink').attr('href', url);
  window.location.href = $('.downloadLink').attr('href');
});
