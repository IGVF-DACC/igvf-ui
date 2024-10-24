from constructs import Construct

from infrastructure.config import Config

from aws_cdk.aws_cloudwatch import Metric
from aws_cdk.aws_cloudwatch import Stats

from aws_cdk.aws_cloudwatch_actions import SnsAction

from aws_cdk.aws_elasticache import CfnCacheCluster

from infrastructure.constructs.existing.types import ExistingResources

from dataclasses import dataclass

from typing import Any


ENGINE_CPU_ALARM_THRESHOLD_PERCENT = 90

CPU_ALARM_THRESHOLD_PERCENT = 90

MEMORY_ALARM_THRESHOLD_PERCENT = 90


@dataclass
class RedisAlarmsProps:
    config: Config
    existing_resources: ExistingResources
    cfn_cache_cluster: CfnCacheCluster


class RedisAlarms(Construct):

    props: RedisAlarmsProps
    alarm_action: SnsAction

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            props: RedisAlarmsProps,
            **kwargs: Any
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.props = props
        self._define_alarm_action()
        self._add_engine_cpu_alarm()
        self._add_cpu_alarm()
        self._add_memory_alarm()

    def _define_alarm_action(self) -> None:
        # Cloudwatch action targeting SNS topic.
        self.alarm_action = SnsAction(
            self.props.existing_resources.notification.alarm_notification_topic
        )

    def _add_engine_cpu_alarm(self) -> None:
        redis_engine_cpu_metric = Metric(
            metric_name='EngineCPUUtilization',
            namespace='AWS/ElastiCache',
            statistic=Stats.MAXIMUM,
            dimensions_map={
                'CacheClusterId': self.props.cfn_cache_cluster.ref,
            },
        )
        redis_engine_cpu_metric.attach_to(self)
        redis_engine_cpu_alarm = redis_engine_cpu_metric.create_alarm(
            self,
            'RedisEngineCPUAlarm',
            evaluation_periods=1,
            threshold=ENGINE_CPU_ALARM_THRESHOLD_PERCENT,
        )
        redis_engine_cpu_alarm.add_alarm_action(
            self.alarm_action
        )
        redis_engine_cpu_alarm.add_ok_action(
            self.alarm_action
        )

    def _add_cpu_alarm(self) -> None:
        redis_cpu_metric = Metric(
            metric_name='CPUUtilization',
            namespace='AWS/ElastiCache',
            statistic=Stats.MAXIMUM,
            dimensions_map={
                'CacheClusterId': self.props.cfn_cache_cluster.ref,
            },
        )
        redis_cpu_metric.attach_to(self)
        redis_cpu_alarm = redis_cpu_metric.create_alarm(
            self,
            'RedisCPUAlarm',
            evaluation_periods=1,
            threshold=ENGINE_CPU_ALARM_THRESHOLD_PERCENT,
        )
        redis_cpu_alarm.add_alarm_action(
            self.alarm_action
        )
        redis_cpu_alarm.add_ok_action(
            self.alarm_action
        )

    def _add_memory_alarm(self) -> None:
        redis_used_memory_metric = Metric(
            metric_name='DatabaseMemoryUsagePercentage',
            namespace='AWS/ElastiCache',
            statistic=Stats.MAXIMUM,
            dimensions_map={
                'CacheClusterId': self.props.cfn_cache_cluster.ref,
            },
        )
        redis_used_memory_metric.attach_to(self)
        redis_used_memory_alarm = redis_used_memory_metric.create_alarm(
            self,
            'RedisUsedMemoryAlarm',
            evaluation_periods=1,
            threshold=90,
        )
        redis_used_memory_alarm.add_alarm_action(
            self.alarm_action
        )
        redis_used_memory_alarm.add_ok_action(
            self.alarm_action
        )
