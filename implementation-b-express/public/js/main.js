(function () {
  "use strict";

  function bindForm(opts) {
    var panel = document.getElementById(opts.panel);
    var showBtn = document.getElementById(opts.show);
    var hideBtn = document.getElementById(opts.hide);
    var form = document.getElementById(opts.form);
    var message = document.getElementById(opts.message);

    function resetMessage() {
      if (message) {
        message.textContent = "";
        message.className = "form-message";
      }
    }

    function openPanel() {
      if (panel) {
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      if (showBtn) {
        showBtn.classList.add("hidden");
      }
    }

    function closePanel() {
      if (panel) {
        panel.classList.add("hidden");
      }
      if (showBtn) {
        showBtn.classList.remove("hidden");
      }
      resetMessage();
    }

    if (showBtn && panel) {
      showBtn.addEventListener("click", openPanel);
    }

    if (hideBtn && panel) {
      hideBtn.addEventListener("click", closePanel);
    }

    // Support additional trigger buttons that open this panel (e.g., table action buttons)
    if (opts.triggerSelector && panel) {
      var triggers = document.querySelectorAll(opts.triggerSelector);
      triggers.forEach(function (trigger) {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          var accountNo = trigger.getAttribute("data-account");
          if (accountNo) {
            var sourceSelect = document.getElementById("txn-source-account");
            if (sourceSelect) {
              sourceSelect.value = accountNo;
              // trigger change event
              var event = new Event("change");
              sourceSelect.dispatchEvent(event);
            }
          }
          openPanel();
        });
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = new FormData(form);
        var payload = {};
        formData.forEach(function (value, key) {
          payload[key] = typeof value === "string" ? value.trim() : value;
        });

        // Basic client validation
        if (payload.transaction_type === "TRANSFER") {
          if (!payload.to_account_number) {
            if (message) {
              message.textContent = "Please select a destination account for the transfer.";
              message.className = "form-message error";
            }
            return;
          }
          var srcAcc = payload.account_number || payload.from_account_number;
          if (srcAcc && srcAcc === payload.to_account_number) {
            if (message) {
              message.textContent = "Source and destination accounts cannot be the same.";
              message.className = "form-message error";
            }
            return;
          }
        }

        if (message) {
          message.textContent = "Processing...";
          message.className = "form-message";
        }

        fetch(opts.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (response) {
            return response.json().then(function (data) {
              return { ok: response.ok, status: response.status, data: data };
            });
          })
          .then(function (result) {
            if (!message) return;

            if (result.ok) {
              message.textContent = result.data.message || "Operation completed successfully.";
              message.className = "form-message success";
              form.reset();
              setTimeout(function () {
                if (opts.onSuccess) {
                  opts.onSuccess(result.data);
                } else {
                  window.location.reload();
                }
              }, 800);
            } else {
              var details = result.data.errors ? " " + result.data.errors.join(" ") : "";
              message.textContent = (result.data.message || "An error occurred.") + details;
              message.className = "form-message error";
            }
          })
          .catch(function () {
            if (message) {
              message.textContent = "Unable to reach the server. Please try again.";
              message.className = "form-message error";
            }
          });
      });
    }
  }

  // Handle dynamic transaction type switching (Show/Hide Destination Account for transfers)
  var txnTypeSelect = document.getElementById("txn-type-select");
  var destAccountGroup = document.getElementById("destination-account-group");
  var destAccountSelect = document.getElementById("txn-dest-account");
  var sourceAccountSelect = document.getElementById("txn-source-account");

  function updateTransferVisibility() {
    if (!txnTypeSelect) return;
    var selectedType = txnTypeSelect.value;
    if (selectedType === "TRANSFER") {
      if (destAccountGroup) destAccountGroup.classList.remove("hidden");
      if (destAccountSelect) destAccountSelect.setAttribute("required", "required");
      filterDestinationOptions();
    } else {
      if (destAccountGroup) destAccountGroup.classList.add("hidden");
      if (destAccountSelect) {
        destAccountSelect.removeAttribute("required");
        destAccountSelect.value = "";
      }
    }
  }

  function filterDestinationOptions() {
    if (!sourceAccountSelect || !destAccountSelect) return;
    var selectedSource = sourceAccountSelect.value;
    var options = destAccountSelect.querySelectorAll("option");
    options.forEach(function (opt) {
      if (!opt.value) return;
      if (opt.value === selectedSource) {
        opt.disabled = true;
        opt.style.display = "none";
        if (destAccountSelect.value === opt.value) {
          destAccountSelect.value = "";
        }
      } else {
        opt.disabled = false;
        opt.style.display = "";
      }
    });
  }

  if (txnTypeSelect) {
    txnTypeSelect.addEventListener("change", updateTransferVisibility);
  }

  if (sourceAccountSelect) {
    sourceAccountSelect.addEventListener("change", filterDestinationOptions);
  }

  // Navigation mobile toggle
  var navToggle = document.getElementById("main-nav");
  var toggleButton = document.querySelector(".nav-toggle");

  if (toggleButton && navToggle) {
    toggleButton.addEventListener("click", function () {
      navToggle.classList.toggle("nav-open");
    });
  }

  // Bind forms
  bindForm({
    panel: "add-customer-panel",
    show: "show-add-customer",
    hide: "hide-add-customer",
    form: "add-customer-form",
    message: "add-customer-message",
    endpoint: "/customers",
    onSuccess: function () {
      window.location.href = "/customers";
    }
  });

  bindForm({
    panel: "add-account-panel",
    show: "show-add-account",
    hide: "hide-add-account",
    form: "add-account-form",
    message: "add-account-message",
    endpoint: "/accounts",
    onSuccess: function (data) {
      if (data && data.account && data.account.account_number) {
        window.location.href =
          "/account/" + encodeURIComponent(data.account.account_number);
      } else {
        window.location.reload();
      }
    }
  });

  bindForm({
    panel: "add-transaction-panel",
    show: "show-add-transaction",
    hide: "hide-add-transaction",
    form: "add-transaction-form",
    message: "add-transaction-message",
    endpoint: "/transactions",
    triggerSelector: "[data-action='open-transaction']",
    onSuccess: function () {
      window.location.reload();
    }
  });
})();