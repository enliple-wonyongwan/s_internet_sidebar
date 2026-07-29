// ------------- common -------------
// class toggle
const bindTargetToggleEvents = ($target) => {
  $target.classList.toggle('is-active');
};

(() => {
  const $btns = document.querySelectorAll('[data-toggle-btn]');
  $btns.forEach(($btn) => {
    const targetKey = $btn.dataset.toggleBtn;
    const targetKeyArray = targetKey.split(' ');

    targetKeyArray.forEach((key) => {
      const $target = document.querySelector(`[data-toggle-target="${CSS.escape(key)}"]`);
      if (!$target) return;

      $btn.addEventListener('click', () => {
        bindTargetToggleEvents($target);
      });
    });
  });
})();
// ------------- /common -------------

// tab
const bindTargetSwiperEvent = ($target) => {
  let isDown = false;
  let startX;
  let scrollLeft;

  // 💡 관성 스크롤을 위한 추가 변수들
  let velX = 0; // 속도
  let lastX = 0; // 직전 마우스 X 좌표
  let animationFrameId; // 애니메이션 프레임 ID

  // 1. 관성 애니메이션 함수 (마우스 뗀 후 부드럽게 멈추는 핵심 로직)
  function beginMomentumTracking() {
    cancelAnimationFrame(animationFrameId);

    function momentumLoop() {
      $target.scrollLeft -= velX; // 계산된 속도만큼 스크롤 이동
      velX *= 0.95; // 0.95를 곱해 속도를 줄임 (마찰력 효과. 숫자가 클수록 오래 밀림)

      // 속도가 0.5 미만으로 떨어지면 애니메이션 멈춤
      if (Math.abs(velX) > 0.5) {
        animationFrameId = requestAnimationFrame(momentumLoop);
      }
    }

    animationFrameId = requestAnimationFrame(momentumLoop);
  }

  // 2. 마우스 누름 (mousedown)
  $target.addEventListener('mousedown', (e) => {
    isDown = true;
    cancelAnimationFrame(animationFrameId); // 진행 중인 관성 동작 멈춤

    startX = e.pageX - $target.offsetLeft;
    scrollLeft = $target.scrollLeft;

    lastX = e.pageX; // 속도 계산용 시작점 저장
    velX = 0; // 속도 초기화
  });

  // 3. 마우스 떼거나 영역 벗어남 (mouseup, mouseleave)
  function endDrag() {
    if (!isDown) return;
    isDown = false;
    beginMomentumTracking(); // 마우스 떼면 관성 스크롤 실행!
  }

  $target.addEventListener('mouseleave', endDrag);
  $target.addEventListener('mouseup', endDrag);

  // 4. 마우스 이동 (mousemove)
  $target.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - $target.offsetLeft;
    const walk = (x - startX) * 1.2; // 드래그 감도
    $target.scrollLeft = scrollLeft - walk;

    // 💡 마우스 이동 속도 측정 (현재 위치 - 직전 위치)
    velX = e.pageX - lastX;
    lastX = e.pageX;
  });
};

(() => {
  const $tabWraps = document.querySelectorAll('[data-tab]');
  if (!$tabWraps.length) return;

  $tabWraps.forEach(($tabWrap) => {
    const tabsKey = $tabWrap.dataset.tab;
    if (tabsKey === 'swiper') {
      bindTargetSwiperEvent($tabWrap);
    }
  });
})();

// chart tooltip
const bindTargetCustomTooltip = (context, priceRange) => {
  const { chart, tooltip } = context;

  let $chartTooltip = document.querySelector('[data-chart-tooltip]');
  if (!$chartTooltip) {
    $chartTooltip = document.createElement('div');
    $chartTooltip.className = 'chart__tooltip';
    $chartTooltip.dataset.chartTooltip = '';

    $chartTooltip.innerHTML = `
      <div class="chart__tooltip-date"></div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-label">최고가</span>
        <span class="chart__tooltip-value chart__tooltip-value--high"></span>
      </div>
      <div class="chart__tooltip-row">
        <span class="chart__tooltip-label">최저가</span>
        <span class="chart__tooltip-value chart__tooltip-value--low"></span>
      </div>
    `;

    document.body.appendChild($chartTooltip);
  }

  // 숨김 처리
  if (tooltip.opacity === 0) {
    $chartTooltip.style.opacity = 0;
    return;
  }

  const dataIndex = tooltip.dataPoints[0].dataIndex;

  // 데이터 표시
  $chartTooltip.querySelector('.chart__tooltip-date').innerHTML = chart.data.labels[dataIndex].replace('.', '/');
  $chartTooltip.querySelector('.chart__tooltip-value--high').innerHTML = `${priceRange[dataIndex].high.toLocaleString()}원`;
  $chartTooltip.querySelector('.chart__tooltip-value--low').innerHTML = `${priceRange[dataIndex].low.toLocaleString()}원`;
  $chartTooltip.style.opacity = 1;

  // canvas 위치
  const canvasRect = chart.canvas.getBoundingClientRect();
  const pointX = canvasRect.left + window.pageXOffset + tooltip.caretX;
  const pointY = canvasRect.top + window.pageYOffset + tooltip.caretY;
  const tooltipWidth = $chartTooltip.offsetWidth;
  let left;
  const top = pointY - 26;

  // labels 절반 기준
  const halfIndex = chart.data.labels.length / 2;

  if (dataIndex < halfIndex) {
    // 앞쪽 절반 → 오른쪽 배치
    left = pointX + 12;
  } else {
    // 뒤쪽 절반 → 왼쪽 배치
    left = pointX - tooltipWidth - 12;
  }

  $chartTooltip.style.left = `${left}px`;
  $chartTooltip.style.top = `${top}px`;
};

const bindTargetChartEvent = ($target) => {
  const data = [
    {
      date: '01.08',
      price: 127000,
      high: 138000,
      low: 119000,
    },
    {
      date: '02.08',
      price: 130000,
      high: 140000,
      low: 120000,
    },
    {
      date: '03.08',
      price: 128000,
      high: 138000,
      low: 119000,
    },
    {
      date: '04.08',
      price: 135000,
      high: 145000,
      low: 125000,
    },
    {
      date: '05.08',
      price: 132000,
      high: 142000,
      low: 123000,
    },
    {
      date: '06.08',
      price: 137000,
      high: 147000,
      low: 128000,
    },
    {
      date: '07.08',
      price: 133000,
      high: 143000,
      low: 124000,
    },
    {
      date: '08.08',
      price: 129000,
      high: 139000,
      low: 121000,
    },
  ];
  const labels = data.map((item) => item.date);
  const prices = data.map((item) => item.price);
  const priceRange = data.map((item) => ({
    high: item.high,
    low: item.low,
  }));

  new Chart($target, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: prices,
          borderColor: '#dce8ff',
          borderWidth: 1,
          tension: 0,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 4,
          pointBackgroundColor: '#dce8ff',
          pointBorderColor: '#dce8ff',
          pointHoverBackgroundColor: '#4285f4',
          pointHoverBorderColor: '#4285f4',
          pointBorderWidth: 0,
        },
      ],
    },

    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          external: (context) => bindTargetCustomTooltip(context, priceRange),
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#bbbbbb',
            font: {
              size: 10,
              family: 'Pretendard, Arial, sans-serif',
              weight: '400',
              style: 'normal',
            },
          },
          border: {
            color: '#e9e9e9',
          },
          grid: {
            display: false,
          },
        },

        y: {
          display: false,
          grid: {
            display: false,
          },
        },
      },

      elements: {
        line: {
          capBezierPoints: false,
        },
      },
    },
  });
};

(() => {
  const $canvasCharts = document.querySelectorAll('[data-chart]');
  if (!$canvasCharts.length) return;

  $canvasCharts.forEach(($canvasChart) => {
    bindTargetChartEvent($canvasChart);
  });
})();
