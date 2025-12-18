import styles from "./styles/AdminUsersPage.module.css"
import { useTranslation } from "react-i18next";
import {Link} from "react-router-dom";
import PaginationLeft from "../../assets/icons/PaginationLeft.tsx";
import PaginationRight from "../../assets/icons/PaginationRight.tsx";
import SearchList from "../../assets/icons/SearchList.tsx";
import SearchCards from "../../assets/icons/SearchCards.tsx";
import { useRequest } from "../../hooks/useRequest.ts";
import { PagedListMetaData, ProfileShortDto, UserService } from "../../services/user.service.ts";
import React, { useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import {UserCardList} from "../../components/admin/UserCardList.tsx";
import {UserCard} from "../../components/admin/UserCard.tsx";
import SvgSearch from "../../assets/icons/Search.tsx";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR, CYRILLIC_ALPHABET, EMPTY_STRING } from "../../constants/event-constants/event.constants.ts";
import { ADMIN_USERS_CONSTANTS, ViewMode } from "../../constants/admin-users-constants/admin-users-constants.ts";

export const AdminUsersPage = () => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();

    const [users, setUsers] = useState<ProfileShortDto[]>([]);
    const [metadata, setMetadata] = useState<PagedListMetaData | null>(null);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState(EMPTY_STRING);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>(ADMIN_USERS_CONSTANTS.VIEW_MODE.LIST);

    const [currentPage, setCurrentPage] = useState(ADMIN_USERS_CONSTANTS.DEFAULT_PAGE);
    const pageSize = ADMIN_USERS_CONSTANTS.PAGE_SIZE;

    const [alphabetExpanded, setAlphabetExpanded] = useState(false);
    const cyrillicLetters = CYRILLIC_ALPHABET.split(EMPTY_STRING);

    const fetchUsers = async () => {
        setLoading(true);

        // Если есть выбранная буква, сбрасываем другие поля поиска
        const emailParam = selectedLetter ? EMPTY_STRING : searchQuery.includes("@") ? searchQuery : EMPTY_STRING;
        const nameParam = selectedLetter ? EMPTY_STRING : !searchQuery.includes("@") ? searchQuery : EMPTY_STRING;
        const filterLastNameParam = selectedLetter || EMPTY_STRING;

        try {
            const response = await request(
                UserService.getUsers(
                    emailParam,
                    nameParam,
                    filterLastNameParam,
                    currentPage,
                    pageSize
                ),
                {
                    errorMessage: i18next("common.access_denied"),
                }
            );
            setUsers(response.data.results);
            setMetadata(response.data.metaData);
            setCurrentPage(response.data.metaData.pageNumber);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchQuery, selectedLetter, currentPage]);

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(ADMIN_USERS_CONSTANTS.DEFAULT_PAGE);
        //fetchUsers();
    };

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter === selectedLetter ? null : letter);
        setSearchQuery(EMPTY_STRING);
        setCurrentPage(ADMIN_USERS_CONSTANTS.DEFAULT_PAGE);
        setAlphabetExpanded(false);
    };

    const toggleAlphabet = () => {
        setAlphabetExpanded(!alphabetExpanded);
        if (alphabetExpanded) {
            setSelectedLetter(null);
        }
    };

    return (
        <div className={styles.admin_users_page}>
            <h1 className={styles.title}>{i18next("administration.administration")}</h1>

            <div className={styles.breadcrumb}>
                <Link to={PUBLIC_ROUTES.PROFILE} className={styles.breadcrumb_link}>
                    {i18next("common.main")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN} className={styles.breadcrumb_link}>
                    {i18next("administration.administration")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN_USERS} className={styles.breadcrumb_active_red}>
                    {i18next("administration.users")}
                </Link>
            </div>

            <form className={styles.search_row} onSubmit={handleSearch}>
                <div className={styles.search_input_container}>
                    <SvgSearch className={styles.search_icon}/>
                    <input
                        className={styles.search_input}
                        type="text"
                        placeholder={i18next("administration.placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button type="submit" className={styles.search_button}>
                    {i18next("administration.search")}
                </button>
            </form>

            <div className={styles.search}>
                <div className={styles.search_row}>
                    <PaginationLeft/>
                    <div className={styles.alphabet_container}>
                        {alphabetExpanded ? (
                            <div className={styles.alphabet_expanded}>
                                {cyrillicLetters.map((letter) => (
                                    <span
                                        key={letter}
                                        className={`${styles.alphabet_letter} ${selectedLetter === letter ? styles.active_letter : EMPTY_STRING}`}
                                        onClick={() => handleLetterClick(letter)}
                                    >
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.alphabet_toggle} onClick={toggleAlphabet}>
                                {selectedLetter ? selectedLetter : ADMIN_USERS_CONSTANTS.ALPHABET_DEFAULT_LABEL}
                            </p>
                        )}
                    </div>
                    <PaginationRight />
                </div>

                <div className={styles.view_toggle}>
                    <SearchList
                        onClick={() => setViewMode(ADMIN_USERS_CONSTANTS.VIEW_MODE.LIST)}
                        active={viewMode === ADMIN_USERS_CONSTANTS.VIEW_MODE.LIST}
                        style={{cursor: 'pointer'}}
                    />
                    <SearchCards
                        onClick={() => setViewMode('cards')}
                        active={viewMode === 'cards'}
                        style={{cursor: 'pointer'}}
                    />
                </div>
            </div>

            <div className={styles.users_container}>
                {loading ? (
                    <p>{i18next("common.loading")}</p>
                ) : users.length === 0 ? (
                    <p>{i18next("administration.no_users")}</p>
                ) : viewMode === ADMIN_USERS_CONSTANTS.VIEW_MODE.LIST ? (
                    users.map((user) => (
                        <Link to={ADMIN_ROUTES.ADMIN_USER(user.id)} key={user.id} className={styles.user_link}>
                            <UserCardList user={user} />
                        </Link>
                    ))
                ) : (
                    <div className={styles.card_grid}>
                        {users.map((user) => (
                            <Link to={ADMIN_ROUTES.ADMIN_USER(user.id)} key={user.id} className={styles.user_link}>
                                <UserCard user={user} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.pagination_container}>
                <Pagination
                    count={metadata?.pageCount || ADMIN_USERS_CONSTANTS.DEFAULT_PAGE}
                    page={currentPage}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
};