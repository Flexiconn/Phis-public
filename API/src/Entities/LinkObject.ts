import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class LinkObject {
    @PrimaryKey()
    url! : string

    @Property()
    ip!: string

    @Property()
    length_url!: number

    @Property()
    length_hostname!: number

    @Property()
    nb_dots!:number

    @Property()
    nb_hyphens!: number

    @Property()
    nb_at!: number

    @Property()
    nb_qm!: number

    @Property()
    nb_and!: number

    @Property()
    nb_or!: number

    @Property()
    nb_eq!: number

    @Property()
    nb_underscore!: number

    @Property()
    nb_tilde!: number

    @Property()
    nb_percent!: number

    @Property()
    nb_slash!: number

    @Property()
    nb_star!: number

    @Property()
    nb_colon!: number

    @Property()
    nb_comma!: number

    @Property()
    nb_semicolumn!: number

    @Property()
    nb_dollar!: number

    @Property()
    nb_space!: number

    @Property()
    nb_www!: number

    @Property()
    nb_com!: number

    @Property()
    nb_dslash!: number

    @Property()
    http_in_path!: number

    @Property()
    https_token!: number

    @Property()
    ratio_digits_url!: number

    @Property()
    ratio_digits_host!: number

    @Property()
    punycode!: number

    @Property()
    port!: number

    @Property()
    tld_in_path!: number

    @Property()
    tld_in_subdomain!: number

    @Property()
    abnormal_subdomain!: number

    @Property()
    nb_subdomains!: number

    @Property()
    prefix_suffix!: number

    @Property()
    path_extension!: number

    @Property()
    nb_redirection!: number

    @Property()
    nb_external_redirection!: number

    @Property()
    length_words_raw!: number

    @Property()
    char_repeat!: number

    @Property()
    shortest_words_raw!: number

    @Property()
    shortest_word_host!: number

    @Property()
    shortest_word_path!: number

    @Property()
    longest_words_raw!: number

    @Property()
    longest_word_host!: number

    @Property()
    longest_word_path!: number

    @Property()
    avg_words_raw!: number

    @Property()
    avg_word_host!: number

    @Property()
    avg_word_path!: number

    @Property()
    domain_in_brand!: number

    @Property()
    brand_in_subdomain!: number

    @Property()
    brand_in_path!: number

    @Property()
    suspecious_tld!: number
    
    @Property()
    nb_hyperlinks!: number

    @Property()
    ratio_intHyperlinks!: number

    @Property()
    ratio_extHyperlinks!: number

    @Property()
    ratio_nullHyperlinks!: number

    @Property()
    nb_extCSS!: number

    @Property()
    ratio_intRedirection!: number

    @Property()
    ratio_extRedirection!: number

    @Property()
    ratio_intErrors!: number

    @Property()
    ratio_extErrors!: number

    @Property()
    login_form!: number

    @Property()
    external_favicon!: number

    @Property()
    links_in_tags!: number

    @Property()
    submit_email!: number

    @Property()
    ratio_intMedia!: number

    @Property()
    ratio_extMedia!: number

    @Property()
    sfh!: number

    @Property()
    iframe!: number

    @Property()
    popup_window!: number

    @Property()
    safe_anchor!: number

    @Property()
    empty_title!: number

    @Property()
    domain_in_title!: number

    @Property()
    A_Records!: number

    @Property()
    AAAA_Records!: number

    @Property()
    CNAME_Records!: number

    @Property()
    MX_Records!: number

    @Property()
    NAPTR_Records!: number

    @Property()
    NS_Records!: number

    @Property()
    PTR_Records!: number

    @Property()
    SOA_Records!: number

    @Property()
    SRV_Records!: number

    @Property()
    TXT_Records!: number

    @Property()
    lon!: number

    @Property()
    lat!: number

    @Property()
    dns_record!: number

    @Property()
    self_signed!: number

    @Property()
    page_index!: number

    @Property()
    page_rank!: number

    @Property()
    status!: number
}