import { Breadcrumb, Col, Row } from "antd";
import style from "./ViewDetails.module.css";
import Excel from "../../../../../../assets/img/xls.png";
import { useGlobalModal } from "../../../../../../context/GlobalModalContext";
import CustomButton from "../../../../../../components/buttons/button";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewDetails = () => {
  const navigate = useNavigate();

  const { showViewDetailPageInTatOnHta, setShowViewDetailPageInTatOnHta } =
    useGlobalModal();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Row justify="start" align="middle" className={style.breadcrumbRow}>
        <Col>
          <Breadcrumb
            separator=">"
            className={style.customBreadcrumb}
            items={[
              {
                title: (
                  <span
                    onClick={() => {
                      navigate("/PAD/hta-reports");
                      setShowViewDetailPageInTatOnHta(false);
                    }}
                    className={style.breadcrumbLink}
                  >
                    Reports
                  </span>
                ),
              },
              {
                title: (
                  <span
                    onClick={() => setShowViewDetailPageInTatOnHta(false)}
                    className={style.breadcrumbLink}
                  >
                    TAT Request Approvals
                  </span>
                ),
              },
              {
                title: (
                  <span className={style.breadcrumbText}>View Details</span>
                ),
              },
            ]}
          />
        </Col>

        <Col>
          <div className={style.headerActionsRow}>
            <CustomButton
              text={
                <span className={style.exportButtonText}>
                  Export
                  <span className={style.iconContainer}>
                    {open ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </span>
              }
              className="small-light-button-report"
              onClick={() => setOpen((prev) => !prev)}
            />
          </div>

          {/* 🔷 Export Dropdown */}
          {open && (
            <div className={style.dropdownExport}>
              <div className={style.dropdownItem}>
                <img src={Excel} alt="Excel" draggable={false} />
                <span>Export Excel</span>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ViewDetails;
