(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            var willOpen = menu.hidden;
            menu.hidden = !willOpen;
            toggle.setAttribute("aria-expanded", String(willOpen));
        });

        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.hidden = true;
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    var form = document.querySelector("[data-pricing-form]");
    if (!form) return;

    var input = form.querySelector("[data-accounts]");
    var yearly = form.querySelector("[data-yearly]");
    var result = form.querySelector("[data-result]");
    var priceEl = form.querySelector("[data-price]");
    var periodEl = form.querySelector("[data-period]");
    var codeEl = form.querySelector("[data-codes]");
    var saveEl = form.querySelector("[data-save]");
    var errorEl = form.querySelector("[data-error]");

    function quote(accountNum, isYearly) {
        var monthly;
        if (accountNum <= 2) monthly = 100;
        else if (accountNum <= 5) monthly = 200;
        else if (accountNum <= 199) monthly = 200 + (accountNum - 5) * 10;
        else if (accountNum <= 499) monthly = 2000 + (accountNum - 200) * 6;
        else if (accountNum <= 999) monthly = 2000 + 300 * 6 + (accountNum - 500) * 5;
        else return { contact: true };

        var price = isYearly ? Math.round(monthly * 12 * 0.85) : monthly;
        return {
            price: price,
            codes: Math.round((price * 0.2) / 0.005),
            savings: isYearly ? monthly * 12 - price : 0,
            yearly: isYearly
        };
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var accountNum = parseInt(input.value, 10);
        errorEl.hidden = true;

        if (!accountNum || accountNum < 1) {
            errorEl.textContent = "请输入大于 0 的账号数量。";
            errorEl.hidden = false;
            result.hidden = true;
            input.focus();
            return;
        }

        var quoted = quote(accountNum, yearly.checked);
        result.hidden = false;

        if (quoted.contact) {
            periodEl.textContent = "1000 个及以上账号";
            priceEl.textContent = "请联系客服";
            codeEl.textContent = "按实付金额计算";
            saveEl.hidden = true;
            return;
        }

        periodEl.textContent = quoted.yearly ? "12 个月，85 折" : "30 天";
        priceEl.textContent = quoted.price.toLocaleString("zh-CN") + " 元";
        codeEl.textContent = quoted.codes.toLocaleString("zh-CN") + " 次";

        if (quoted.yearly) {
            saveEl.hidden = false;
            saveEl.textContent = "比按月支付 12 个月节省 " + quoted.savings.toLocaleString("zh-CN") + " 元。";
        } else {
            saveEl.hidden = true;
        }
    });
})();
