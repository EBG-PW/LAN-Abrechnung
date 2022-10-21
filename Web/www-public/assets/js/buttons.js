/**
 * Will send a logout request to destroy the current token
 * @returns {Promise}
 */
function logout() {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/login/logout`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
    });
    posting.done(function (result) {
      setTimeout(function () { window.location.replace(`${baseUrl}api/v1/login/login`); }, 100);
      localStorage.removeItem('Admin');
      localStorage.removeItem('Permissions_Read');
      localStorage.removeItem('Permissions_Write');
      localStorage.removeItem('Browser');
      localStorage.removeItem('ip');
      localStorage.removeItem('Language');
      localStorage.removeItem('Time');
      localStorage.removeItem('Token');
      localStorage.removeItem('UserID');
      localStorage.removeItem('Username');
    })
    posting.fail(function (err) {
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
      }
    });
  }
}

/**
 * Will send a logout request to destroy the current token
 * @returns {Promise}
 */
function toggle_allowed_state(userid) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/strom/PlugsToggleAllowedState`,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: { UserID: userid }
    });
    posting.done(function (result) {
      Table_AdminUserDataList()
    })
    posting.fail(function (err) {
      if (err.status === 501) {
        SnackBar({
          message: `Error ${err.status} - ${err.responseJSON.Message}`,
          width: "400px",
          speed: SnackBox_Timeout,
          position: SnackBox_Location,
          fixed: true,
          status: "error",
        });
      }
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.no_chance'))
      }
    });
  }
}

/**
 * Will this will write the order into the users shopinglist
 * @returns {Promise}
 */
function switch_order_to_shopinglist(order_key) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/bestellungen/switchOrderStateByKey`,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: { key: order_key }
    });
    posting.done(function (result) {
      Table_BestellungList(result.orderid)
    })
    posting.fail(function (err) {
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.no_chance'))
      }
    });
  }
}

/**
 * Will this will delete unordert Order from a users order list by order key
 * @param {string} key
 * @returns {Promise}
 */
function delete_user_order_by_key(key) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/bestellungen/delUserOrder`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: JSON.stringify({ key: key })
    });
    posting.done(function (result) {
      Table_UserBestellungList(result.orderid)
    })
    posting.fail(function (err) {
      if (err.status === 410) {
        console.log(err)
        alert(translate('Buttons.delete_user_order_by_key.notime'))
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.no_chance'))
      }
    });
  }
}

/**
 * Will set a new permissions group to the selected user
 * @param {string} userid
 * @param {string} dropdown_id
 * @returns {Promise}
 */
function change_permisionGroup(userid, dropdown_id) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/user/setPermisionGroup`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: JSON.stringify({ userid: userid, permgroup: $(`#${dropdown_id}`).val() })
    });
    posting.done(function (result) {
      Table_AdminUserDataList()
    })
    posting.fail(function (err) {
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.no_chance'))
      }
    });
  }
}

/**
 * Will set the payed status for the user
 * @param {string} userid
 * @returns {Promise}
 */
function setPayed_state(userid) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/user/setPayedState`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: JSON.stringify({ userid: userid })
    });
    posting.done(function (result) {
      Table_AdminUserDataList()
    })
    posting.fail(function (err) {
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.no_chance'))
      }
    });
  }
}

function toggle_payment_allowed_state(userid) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const posting = $.ajax({
      url: `${baseUrl}api/v1/user/setPaymentAllowedState`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: JSON.stringify({ userid: userid })
    });
    posting.done(function (result) {
      SubUserManagmentTabelle()
    })
    posting.fail(function (err) {
      if (err.status === 400) { SubUserManagmentTabelle() }
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.toggle_error'))
      }
    });
  }
}

function change_subuser_payed_amount(userid) {
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    const amount_string = $(`#input_userid_${userid}`).val();
    const amount = parseFloat(amount_string.replace('€', '').replace(',', '.')) * 100;
    const posting = $.ajax({
      url: `${baseUrl}api/v1/user/setSubuserPayedAmount`,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
      data: JSON.stringify({ userid: userid, amount: amount })
    });
    posting.done(function (result) {
      SubUserManagmentTabelle()
    })
    posting.fail(function (err) {
      if (err.status === 400) { SubUserManagmentTabelle() }
      if (err.status === 401) {
        console.log(err)
      } else if (err.status === 500) {
        console.log(err)
        alert(translate('Buttons.toggle_allowed_state.setAmountError'))
      }
    });
  }
}