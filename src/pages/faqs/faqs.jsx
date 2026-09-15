import React, { useCallback, useEffect, useRef, useState } from "react";
import { Row, Col, Collapse, Spin } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { PageLayout } from "../../components";
import EmptyState from "../../components/emptyStates/empty-states";
import style from "./faqs.module.css";
import { GetPadFaqsRequest } from "../../api/faqApi";
import { useNotification } from "../../components/NotificationProvider/NotificationProvider";
import { useGlobalLoader } from "../../context/LoaderContext";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { formatApiDateTime } from "../../common/funtions/rejex";

const { Panel } = Collapse;
const PAGE_SIZE = 10;

/**
 * Faqs - SRS "FAQ": pre-defined FAQ in collapsible panels. Collapsed =
 * plus icon, expanded = cross icon. Multiple panels can be expanded
 * simultaneously (no `accordion` prop - Collapse's default behavior
 * already allows this). Vertical scroll, lazy-loads more as the user
 * scrolls down.
 */
const Faqs = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const containerRef = useRef(null);

  const { showNotification } = useNotification();
  const { showLoader } = useGlobalLoader();
  const { callApi } = useApi();

  const [faqData, setFaqData] = useState({
    faqs: [],
    totalRecords: 0,
    lastUpdatedDate: "",
    lastUpdatedTime: "",
  });
  const [activeKeys, setActiveKeys] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchApiCall = useCallback(
    async (pageNumber, replace = false, showLoaderFlag = true) => {
      if (showLoaderFlag) showLoader(true);

      const res = await GetPadFaqsRequest({
        callApi,
        showNotification,
        showLoader,
        requestdata: { PageNumber: pageNumber, Length: PAGE_SIZE },
        navigate,
      });

      if (res) {
        setFaqData((prev) => ({
          faqs: replace ? res.faqs : [...(prev.faqs || []), ...res.faqs],
          totalRecords: res.totalRecords,
          // Top-level, same across every page - just take whatever the
          // latest response says.
          lastUpdatedDate: res.lastUpdatedDate || prev.lastUpdatedDate,
          lastUpdatedTime: res.lastUpdatedTime || prev.lastUpdatedTime,
        }));
      }
      showLoader(false);
    },
    [callApi, navigate, showLoader, showNotification]
  );

  // Initial fetch
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchApiCall(0, true, true);
  }, [fetchApiCall]);

  // Update hasMore whenever faqData changes
  useEffect(() => {
    setHasMore(faqData.faqs.length < faqData.totalRecords);
  }, [faqData]);

  const handleScroll = async () => {
    if (!containerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setLoadingMore(true);
      try {
        // The doc's own example request is { "PageNumber": 0, "Length": 10 }
        // for the first page - treating PageNumber as a 0-indexed page
        // index (offset = PageNumber * Length), derived from how many rows
        // are already loaded.
        const nextPage = Math.floor(faqData.faqs.length / PAGE_SIZE);
        await fetchApiCall(nextPage, false, false);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [containerRef.current, hasMore, loadingMore, faqData]);

  return (
    <PageLayout
      background="white"
      style={{ marginTop: "10px" }}
      // className={activeFilters.length > 0 && "changeHeight"}
    >
      <div>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 className={style.heading}>FAQ</h2>
          </Col>
          {faqData.lastUpdatedDate && (
            <Col>
              <span className={style.lastUpdated}>
                Last Updated:{" "}
                {formatApiDateTime(
                  `${faqData.lastUpdatedDate} ${faqData.lastUpdatedTime}`
                )}
              </span>
            </Col>
          )}
        </Row>

        <div ref={containerRef} className={style.scrollArea}>
          {faqData.faqs.length > 0 ? (
            <>
              <Collapse
                activeKey={activeKeys}
                onChange={(keys) => setActiveKeys(keys)}
                bordered={false}
                className={style.collapse}
                expandIconPosition="end"
                expandIcon={({ isActive }) =>
                  isActive ? (
                    <CloseOutlined className={style.expandIcon} />
                  ) : (
                    <PlusOutlined className={style.expandIcon} />
                  )
                }
              >
                {faqData.faqs.map((faq) => {
                  const faqKey = String(faq.faqId ?? faq.faqID);
                  // FIXED (contract change): render the backend's own
                  // pre-split `descriptionPoints` instead of parsing bullets
                  // out of the flat `description` text ourselves - present
                  // uniformly on every FAQ now, even non-bulleted ones
                  // (single-element array), so no special-casing needed
                  // here. Falls back to the flat description only if an
                  // older/unexpected response shape omits it.
                  const points = Array.isArray(faq.descriptionPoints)
                    ? faq.descriptionPoints
                    : faq.description
                    ? [faq.description]
                    : [];

                  return (
                    <Panel
                      key={faqKey}
                      header={
                        <span className={style.question}>{faq.question}</span>
                      }
                      className={style.panel}
                    >
                      {points.length > 1 ? (
                        <ul className={style.description}>
                          {points.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className={style.description}>{points[0]}</div>
                      )}
                    </Panel>
                  );
                })}
              </Collapse>

              {loadingMore && (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <Spin size="small" />
                </div>
              )}
            </>
          ) : (
            <EmptyState style={{ minHeight: "50vh" }} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Faqs;
