

document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");
  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");
  const tabButtons = document.querySelectorAll(".tab-button");
  const copyBtn = document.getElementById("copyBtn");
  const copySuccess = document.getElementById("copySuccess");
  const wechatId = document.getElementById("wechatId")?.textContent || "";
  let currentPage = 1;
  const itemsPerPage = 8 * 4;
  let currentProducts = [];

  const categoryMap = {
    "zhifu": "data/zhifu.json",
    "siwa": "data/siwa.json",
    "daojv": "data/daojv.json"
  };

  function getSalesBadge(sales) {
    if (sales >= 10000) return "💎 爆款";
    if (sales >= 5000) return "🔥 热卖";
    if (sales >= 1000) return "✨ 限时";
    return "";
  }

  function showGridAnimated() {
    productGrid.classList.remove("visible");
    setTimeout(() => productGrid.classList.add("visible"), 50);
  }

  function loadCategory(category) {
    currentPage = 1;
    if (category === "全部" || category === "all") {
      Promise.all(Object.values(categoryMap).map(url =>
        fetch(url).then(res => res.json()).catch(() => [])
      )).then(data => {
        const all = data.flat();
        renderProducts(all);
        showGridAnimated();
      });
    } else {
      const url = categoryMap[category];
      fetch(url).then(res => res.json()).then(data => {
        renderProducts(data);
        showGridAnimated();
      });
    }
  }

  function renderProducts(products) {
    currentProducts = products;
    const paginationInfo = document.getElementById("pageInfo");
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = products.slice(start, start + itemsPerPage);

    productGrid.innerHTML = "";
    pageItems.forEach(p => {
      const cleanTitle = (p.title || "").replace(/^[💎🔥✨]/, "");
      const badgeText = getSalesBadge(p.sales);
      const badge = badgeText ? `<div class="badge-tag">${badgeText}</div>` : "";

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        ${badge}
        <div class="card-carousel">
        ${p.images.map((src, idx) => `<img src="${src}" loading="lazy" class="${idx === 0 ? 'active' : ''}">`).join("")}
        </div>
        <div class="title">${cleanTitle}</div>
        <div class="sales-info">销量：${p.sales || 0} 件</div>
      `;

      const images = card.querySelectorAll(".card-carousel img");
      let currentIdx = 0;
      setInterval(() => {
        images.forEach((img, i) => img.classList.toggle("active", i === (currentIdx + 1) % images.length));
        currentIdx = (currentIdx + 1) % images.length;
      }, 2500);

      card.addEventListener("click", () => {
        modalContent.innerHTML = `
          <div class="carousel">
            ${p.images.map((src, idx) => `<img src="${src}" class="carousel-img${idx === 0 ? ' active' : ''}" loading="lazy">`).join("")}
            <button class="prev">&#10094;</button>
            <button class="next">&#10095;</button>
            <div class="carousel-dots">
              ${p.images.map((_, idx) => `<span class="dot${idx === 0 ? ' active' : ''}" data-index="${idx}"></span>`).join("")}
            </div>
          </div>
          <h2>${cleanTitle}</h2>
          <p class="sales-info">销量：${p.sales || 0} 件</p>
          <p class="desc">${p.desc}</p>
          <button class="btn" type="button">${p.btnText}</button>
        `;

        const copyBtnInModal = modalContent.querySelector(".btn");
        copyBtnInModal?.addEventListener("click", (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(wechatId).then(() => {
            const successTip = document.createElement("p");
            successTip.textContent = "微信号已复制，快去添加吧！";
            successTip.style.color = "#28a745";
            successTip.style.marginTop = "0.8rem";
            modalContent.appendChild(successTip);
            setTimeout(() => successTip.remove(), 2000);
          });
        });

        modal.classList.add("show", "fade-in");
        modal.classList.remove("fade-out");

        const images = modalContent.querySelectorAll(".carousel-img");
        const dots = modalContent.querySelectorAll(".dot");
        let current = 0;
        function showSlide(index) {
          images.forEach((img, i) => img.classList.toggle("active", i === index));
          dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
          current = index;
        }
        let autoSlide = setInterval(() => {
          showSlide((current + 1) % images.length);
        }, 3000);

        modalContent.querySelector(".prev").addEventListener("click", () => {
          showSlide((current - 1 + images.length) % images.length);
        });

        modalContent.querySelector(".next").addEventListener("click", () => {
          showSlide((current + 1) % images.length);
        });

        dots.forEach(dot => {
          dot.addEventListener("click", () => {
            showSlide(parseInt(dot.dataset.index));
          });
        });
      });

      productGrid.appendChild(card);
    });

    paginationInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    document.getElementById("prevPage").disabled = currentPage <= 1;
    document.getElementById("nextPage").disabled = currentPage >= totalPages;
  }

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(currentProducts);
      showGridAnimated();
    }
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(currentProducts);
      showGridAnimated();
    }
  });

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.category;
      loadCategory(category);
    });
  });

  closeModal.addEventListener("click", () => {
    modal.classList.remove("fade-in");
    modal.classList.add("fade-out");
    setTimeout(() => modal.classList.remove("show"), 300);
  });

  copyBtn?.addEventListener("click", () => {
    navigator.clipboard.writeText(wechatId).then(() => {
      if (copySuccess) {
        copySuccess.style.display = "inline";
        setTimeout(() => (copySuccess.style.display = "none"), 2000);
      }
    });
  });

  document.getElementById("toTopBtn")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("toTabsBtn")?.addEventListener("click", () => {
    document.getElementById("tabs")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("toWeChatBtn")?.addEventListener("click", () => {
    document.getElementById("copyBtn")?.click();
    const wechatSection = document.querySelector(".wechat-section");
    if (wechatSection) wechatSection.scrollIntoView({ behavior: "smooth" });
  });

  loadCategory("全部");
});
