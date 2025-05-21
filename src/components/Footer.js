// src/components/Footer.js (чистый JS без JSX)
// Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      {/* содержимое футера */}
    </footer>
  );
}

export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';

  const footerInner = document.createElement('div');
  footerInner.className = 'footer-inner';

  // Левая колонка
  const footerLeft = document.createElement('div');
  footerLeft.className = 'footer-left';

  const leftTitle = document.createElement('p');
  leftTitle.innerHTML = '<strong>Связаться с нами:</strong>';
  const leftEmail = document.createElement('p');
  leftEmail.textContent = 'konstruktivno.praktika@gmail.com';

  footerLeft.appendChild(leftTitle);
  footerLeft.appendChild(leftEmail);

  // Центр
  const footerCenter = document.createElement('div');
  footerCenter.className = 'footer-center';

  const centerTitle = document.createElement('p');
  centerTitle.innerHTML = '<strong>Мы в соцсетях:</strong>';

  const socialIcons = document.createElement('div');
  socialIcons.className = 'social-icons';

  const tgLink = document.createElement('a');
  tgLink.href = 'https://t.me/tuskcherezdeazol';
  tgLink.target = '_blank';
  tgLink.rel = 'noreferrer';
  tgLink.title = 'Telegram';
  tgLink.textContent = '📨';

  const vkLink = document.createElement('a');
  vkLink.href = 'https://vk.com/ktiib';
  vkLink.target = '_blank';
  vkLink.rel = 'noreferrer';
  vkLink.title = 'VK';
  vkLink.textContent = '👥';

  const gitLink = document.createElement('a');
  gitLink.href = 'https://github.com/yourprofile';
  gitLink.target = '_blank';
  gitLink.rel = 'noreferrer';
  gitLink.title = 'GitHub';
  gitLink.textContent = '💻';

  socialIcons.appendChild(tgLink);
  socialIcons.appendChild(vkLink);
  socialIcons.appendChild(gitLink);

  footerCenter.appendChild(centerTitle);
  footerCenter.appendChild(socialIcons);

  // Правая колонка
  const footerRight = document.createElement('div');
  footerRight.className = 'footer-right';

  const privacyLinkP = document.createElement('p');
  const privacyLink = document.createElement('a');
  privacyLink.href = 'privacy-policy.html';
  privacyLink.target = '_blank';
  privacyLink.rel = 'noreferrer';
  privacyLink.textContent = 'Политика конфиденциальности';

  privacyLinkP.appendChild(privacyLink);

  const copyRightP = document.createElement('p');
  copyRightP.textContent = '© 2025 Tusk';

  footerRight.appendChild(privacyLinkP);
  footerRight.appendChild(copyRightP);

  // Собираем всё
  footerInner.appendChild(footerLeft);
  footerInner.appendChild(footerCenter);
  footerInner.appendChild(footerRight);
  footer.appendChild(footerInner);

  return footer;
}
