import styles from "./styles/EducationBlock.module.css"
import {EducationEntryDto} from "../../services/profile.service.ts";
import {useTranslation} from "react-i18next";

interface EducationCardProps {
    entry: EducationEntryDto;
}

export const EducationCard = (props: EducationCardProps) => {
    const { t: i18next } = useTranslation('common');

    return (
        <div className={styles.item_education}>
            <div className={styles.header}>
                <h2 className={styles.bold_text}>{props.entry.educationLevel.name}</h2>
                <span className={styles.bold_text}>{props.entry.educationStatus.name}</span>
            </div>

            <div className={styles.section_container}>
                <div className={styles.section_row}>
                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.years")}</div>
                        <div className={styles.section_base_text}>{props.entry.educationYears.name}</div>
                    </div>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.num")}</div>
                        <div className={styles.section_base_text}>{props.entry.creditBooknumber}</div>
                    </div>
                </div>

                <div className={styles.section_row}>
                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.form")}</div>
                        <div className={styles.section_base_text}>{props.entry.educationForm.name}</div>
                    </div>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.base")}</div>
                        <div className={styles.section_base_text}>{props.entry.educationBase.name}</div>
                    </div>
                </div>

                <div className={styles.section_item_block}>
                    <div className={styles.section_name_text}>{i18next("education.faculty")}</div>
                    <div className={styles.section_base_text}>{props.entry.faculty.name}</div>
                </div>

                <div className={styles.section_item_block}>
                    <div className={styles.section_name_text}>{i18next("education.direction")}</div>
                    <div className={styles.section_base_text}>{props.entry.educationDirection.name}</div>
                </div>

                <div className={styles.section_item_block}>
                    <div className={styles.section_name_text}>{i18next("education.profile")}</div>
                    <div className={styles.section_base_text}>{props.entry.educationProfile.name}</div>
                </div>

                <div className={styles.section_row}>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.course")}</div>
                        <div className={styles.section_base_text}>{props.entry.course}</div>
                    </div>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("education.group")}</div>
                        <div className={styles.section_base_text}>{props.entry.group.name}</div>
                    </div>

                </div>
            </div>
        </div>
    )
}