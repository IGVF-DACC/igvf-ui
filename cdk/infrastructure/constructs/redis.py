from aws_cdk import CfnOutput
from aws_cdk import Stack
from aws_cdk import RemovalPolicy
from aws_cdk import Tags

from constructs import Construct

from aws_cdk.aws_ec2 import SecurityGroup
from aws_cdk.aws_ec2 import SubnetSelection
from aws_cdk.aws_ec2 import SubnetType

from aws_cdk.aws_elasticache import CfnCacheCluster
from aws_cdk.aws_elasticache import CfnSubnetGroup

from infrastructure.config import Config

from infrastructure.constructs.existing.types import ExistingResources

from typing import Any

from dataclasses import dataclass
from dataclasses import field


@dataclass
class RedisProps:
    config: Config
    existing_resources: ExistingResources
    cache_node_type: str = 'cache.t4g.small'
    engine_version: str = '7.1'
    subnet_type: SubnetType = SubnetType.PRIVATE_ISOLATED


class Redis(Construct):

    security_group: SecurityGroup
    subnet_group: CfnSubnetGroup
    props: RedisProps
    url: str

    def __init__(
            self,
            scope: Construct,
            construct_id: str,
            *,
            props: RedisProps,
            **kwargs: Any,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        self.props = props
        self._define_security_group()
        self._define_subnet_group()
        self._define_cache_cluster()
        self._add_tags_to_cache_cluster()
        self._define_url()
        self._add_alarms()
        self._export_values()

    def _define_security_group(self) -> None:
        self.security_group = SecurityGroup(
            self,
            'SecurityGroup',
            vpc=self.props.existing_resources.network.vpc,
            description='Security group for Redis cluster',
            allow_all_outbound=False,
        )

    def _define_subnet_group(self) -> None:
        self.subnet_group = CfnSubnetGroup(
            self,
            'CfnSubnetGroup',
            description='Subnet group for Redis cluster',
            subnet_ids=self.props.existing_resources.network.vpc.select_subnets(
                subnet_type=self.props.subnet_type,
            ).subnet_ids
        )

    def _define_cache_cluster(self) -> None:
        self.cache_cluster = CfnCacheCluster(
            self,
            'CfnCacheCluster',
            num_cache_nodes=1,
            engine='redis',
            engine_version=self.props.engine_version,
            cache_node_type=self.props.cache_node_type,
            cache_subnet_group_name=self.subnet_group.ref,
            vpc_security_group_ids=[
                self.security_group.security_group_id,
            ]
        )

    def _add_tags_to_cache_cluster(self) -> None:
        Tags.of(self.cache_cluster).add(
            'branch',
            self.props.config.branch,
        )

    def _define_url(self) -> None:
        self.url = f'{self.cache_cluster.attr_redis_endpoint_address}:{self.cache_cluster.attr_redis_endpoint_port}'

    def _add_alarms(self) -> None:
        pass

    def _export_values(self) -> None:
        export_default_explicit_values(self)


def export_default_explicit_values(redis: Redis) -> None:
    parent_stack = Stack.of(redis)
    parent_stack.export_value(
        redis.cache_cluster.attr_redis_endpoint_address
    )
    parent_stack.export_value(
        redis.cache_cluster.attr_redis_endpoint_port
    )
    parent_stack.export_value(
        redis.security_group.security_group_id,
    )
