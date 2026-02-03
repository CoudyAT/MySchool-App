import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoFacebook,
  logoTwitter,
  logoLinkedin,
  logoInstagram,
  logoYoutube,
} from 'ionicons/icons';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [CommonModule, IonIcon],
})
export class FooterComponent implements OnInit {
  @Input() footerLinks: FooterLink[] = [
    {
      label: 'Mentions légales',
      href: '#',
      external: false,
    },
    {
      label: "Conditions générales d'utilisation",
      href: '/terms',
      external: false,
    },
    {
      label: 'Politique de protection des données personnelles',
      href: '#',
      external: false,
    },
    {
      label: 'Cookies',
      href: '#',
      external: false,
    },
    {
      label: "Déclaration d'accessibilité",
      href: '#',
      external: false,
    },
    {
      label: 'Sécurité',
      href: '#',
      external: false,
    },
  ];

  @Input() socialLinks: SocialLink[] = [
    {
      label: 'Facebook',
      url: 'https://facebook.com/myschool',
      icon: 'logo-facebook',
    },
    {
      label: 'Twitter',
      url: 'https://twitter.com/myschool',
      icon: 'logo-twitter',
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/company/myschool',
      icon: 'logo-linkedin',
    },
    {
      label: 'Instagram',
      url: 'https://instagram.com/myschool',
      icon: 'logo-instagram',
    },
  ];

  currentYear: number = new Date().getFullYear();

  constructor() {
    addIcons({
      logoFacebook,
      logoTwitter,
      logoLinkedin,
      logoInstagram,
      logoYoutube,
    });
  }

  ngOnInit() {
    // Vous pouvez charger les liens dynamiquement depuis un service ici
    // this.footerService.getFooterLinks().subscribe(links => {
    //   this.footerLinks = links;
    // });
  }
}
