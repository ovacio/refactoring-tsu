import {useState} from "react";
import styles from "../../pages/styles/ProfilePage.module.css";
import st from "./styles/ProfileTabs.module.css"
import {EducationBlock} from "./EducationBlock";
import {EmployeeBlock} from "./EmployeeBlock";
import {UserType} from "../../services/profile.service.ts";
import {useTranslation} from "react-i18next";
import { EMPTY_STRING } from "../../constants/event-constants/event.constants.ts";

interface Props {
    userTypes: UserType[] | null;
}

export const ProfileTabs = ({ userTypes }: Props) => {
    const { t: i18next } = useTranslation('common');
    const hasStudent = userTypes?.includes(UserType.Student);
    const hasEmployee = userTypes?.includes(UserType.Employee);

    const defaultTab = hasStudent ? "education" : hasEmployee ? "work" : null;
    const [activeTab, setActiveTab] = useState<"education" | "work" | null>(defaultTab);

    if (!defaultTab) return null;

    return (
        <div className={st.main_section}>
            <div className={styles.tabs}>
                {hasStudent && (
                    <button
                        onClick={() => setActiveTab("education")}
                        className={activeTab === "education" ? styles.active : EMPTY_STRING}
                    >
                        {i18next("education.education")}
                    </button>
                )}
                {hasEmployee && (
                    <button
                        onClick={() => setActiveTab("work")}
                        className={activeTab === "work" ? styles.active : EMPTY_STRING}
                    >
                        {i18next("employee.work")}
                    </button>
                )}
            </div>

            <div className={styles.content}>
                {activeTab === "education" && <EducationBlock />}
                {activeTab === "work" && <EmployeeBlock />}
            </div>
        </div>
    );
};