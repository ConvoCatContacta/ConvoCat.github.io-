import { describe, expect, it } from 'vitest';
import { urlSegura } from './enllacos.ts';

describe('urlSegura', () => {
  it('deixa passar http i https', () => {
    expect(urlSegura('https://www.sitges.cat/bases')).toBe('https://www.sitges.cat/bases');
    expect(urlSegura('http://exemple.cat')).toBe('http://exemple.cat');
  });

  it('descarta els esquemes perillosos', () => {
    // El motiu de tot aquest mòdul: les fonts es refresquen cada dia i no les controlem.
    expect(urlSegura('javascript:alert(1)')).toBeNull();
    expect(urlSegura('JaVaScRiPt:alert(1)')).toBeNull();
    expect(urlSegura('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(urlSegura('vbscript:msgbox(1)')).toBeNull();
  });

  it('descarta els esquemes que no serveixen de res a ningú', () => {
    expect(urlSegura('file:///C:/temp/bases.pdf')).toBeNull();
    expect(urlSegura('chrome-extension://abc/popup.html')).toBeNull();
  });

  it("desembolica l'URL real d'un PDF obert amb l'extensió del Chrome", () => {
    expect(
      urlSegura('chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/https://www.vilassar.cat/b.pdf')
    ).toBe('https://www.vilassar.cat/b.pdf');
  });

  it('completa un amfitrió que ha perdut l\'esquema', () => {
    expect(urlSegura('www.sitges.cat')).toBe('https://www.sitges.cat');
    expect(urlSegura('diputaciodetarragona.cat/ebop/index.php?op=dwn')).toBe(
      'https://diputaciodetarragona.cat/ebop/index.php?op=dwn'
    );
  });

  it('descarta una ruta relativa: resoldria contra el nostre domini', () => {
    // Semblaria un enllaç trencat nostre quan el trencat és el registre d'origen.
    expect(urlSegura('/aprovacio-de-la-modificacio-de-les-bases')).toBeNull();
  });

  it('descarta una adreça de correu: no és una seu electrònica', () => {
    expect(urlSegura('info@fundaciorieragubau.cat')).toBeNull();
    expect(urlSegura('mailto:info@fundaciorieragubau.cat')).toBeNull();
  });

  it('descarta el text lliure', () => {
    expect(urlSegura('Seu electrònica Ministeri')).toBeNull();
    expect(urlSegura('Pendent de publicació')).toBeNull();
    expect(urlSegura('')).toBeNull();
    expect(urlSegura(null)).toBeNull();
    expect(urlSegura('   ')).toBeNull();
  });

  it('no intenta endevinar amb esquemes mal escrits', () => {
    // "ttps://…" podria ser https, però reparar-ho és endevinar i no ho val per un cas.
    expect(urlSegura('ttps://exemple.cat')).toBeNull();
  });
});
